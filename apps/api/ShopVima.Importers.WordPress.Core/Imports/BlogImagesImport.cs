using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Wp;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class BlogImagesImport
{
    private readonly WpClient _wp;
    private readonly ShopDbContext _db;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;
    private readonly MediaDownloadService _downloader;
    private readonly MediaUploadClient _uploader;
    private readonly RankMathClient _rankMath;

    public BlogImagesImport(
        WpClient wp,
        ShopDbContext db,
        WordPressImportOptions opt,
        ExternalMapService map,
        MediaDownloadService downloader,
        MediaUploadClient uploader,
        RankMathClient rankMath)
    {
        _wp = wp;
        _db = db;
        _opt = opt;
        _map = map;
        _downloader = downloader;
        _uploader = uploader;
        _rankMath = rankMath;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var provider = _opt.Provider;

        var posts = await _wp.GetPagedAsync<WpPostDto>(
            "/wp-json/wp/v2/posts",
            query: new Dictionary<string, string> { ["_embed"] = "1" },
            perPage: 50,
            ct: ct
        );

        var updated = 0;

        foreach (var p in posts)
        {
            var postMap = await _map.FindAsync(provider, "BlogPost", p.id.ToString(), ct);
            if (postMap == null) continue;

            var post = await _db.BlogPosts.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == postMap.InternalId, ct);
            if (post == null) continue;

            var media = p._embedded?.FeaturedMedia?.FirstOrDefault();
            if (media == null) continue;

            var largeUrl = media.media_details?.sizes != null &&
                           media.media_details.sizes.TryGetValue("large", out var large)
                ? large?.source_url
                : null;

            var remoteUrl = largeUrl ?? media.source_url;
            if (string.IsNullOrWhiteSpace(remoteUrl)) continue;


            var mediaInternalId = await _map.GetOrCreateInternalIdAsync(
                provider, "Media", media.id.ToString(), slug: null, ct
            );

            var asset = await _db.MediaAssets.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == mediaInternalId, ct);

            // ✅ wpBase را از خود URL وردپرس استخراج کن (مطمئن‌ترین)
            var wpBase = new Uri(remoteUrl).GetLeftPart(UriPartial.Authority);

            // ✅ URL پست وردپرس
            var wpPostUrl = p.link;
            if (string.IsNullOrWhiteSpace(wpPostUrl))
            {
                wpPostUrl = $"{wpBase}/{p.slug}/";
            }
            else
            {
                var u = new Uri(wpPostUrl);
                wpPostUrl = wpBase + u.PathAndQuery;
            }
            if (!wpPostUrl.EndsWith("/")) wpPostUrl += "/";

            try
            {
                var headHtml = await _rankMath.GetHeadHtmlAsync(wpBase, wpPostUrl, ct);
                var (metaTitle, metaDesc, schemas) = HeadParser.Extract(headHtml);

                if (string.IsNullOrWhiteSpace(metaTitle) && string.IsNullOrWhiteSpace(metaDesc))
                    Console.WriteLine($"[SEO] EMPTY title/desc for {wpPostUrl} headLen={headHtml?.Length ?? 0}");


                Console.WriteLine($"Has prop Seo_MetaTitle? {post.GetType().GetProperty("Seo_MetaTitle") != null}");
                Console.WriteLine($"Has prop Seo? {post.GetType().GetProperty("Seo") != null}");

                post.Seo.MetaTitle = metaTitle ?? "";
                post.Seo.MetaDescription = metaDesc ?? "";
                post.Seo.SeoSchemaJson = System.Text.Json.JsonSerializer.Serialize(schemas);

                Console.WriteLine($"[SEO] state={_db.Entry(post).State}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SEO] RankMath failed for {wpPostUrl}: {ex.Message}");
            }



            if (asset != null && !string.IsNullOrWhiteSpace(asset.Url) && asset.Url.StartsWith("/uploads/"))
            {
                var looksLocal = true;
                if (_opt.StoreDownloadedMediaLocally)
                {
                    if (string.IsNullOrWhiteSpace(asset.FileName))
                    {
                        looksLocal = false;
                    }
                    else
                    {
                        var root = _opt.LocalMediaRoot;
                        static string ToAbsPath(string localMediaRoot, string url)
                        {
                            var rel = url.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
                            var fileName = Path.GetFileName(new Uri("http://x" + url).AbsolutePath);
                            return Path.IsPathRooted(localMediaRoot)
                                ? Path.Combine(localMediaRoot, fileName)
                                : Path.Combine(Directory.GetCurrentDirectory(), localMediaRoot, fileName);
                        }

                        var absPath = ToAbsPath(_opt.LocalMediaRoot, asset.Url);
                        if (!File.Exists(absPath))
                            looksLocal = false;
                    }
                }

                if (looksLocal)
                {
                    post.ThumbnailMediaId = asset.Id;
                    TrySetGuid(post, "FeaturedMediaId", asset.Id);
                    TrySetGuid(post, "ThumbnailMediaId", asset.Id);

                    TrySetString(post, "FeaturedImageUrl", asset.Url);
                    TrySetString(post, "ThumbnailUrl", asset.Url);
                    TrySetString(post, "ThumbnailImageUrl", asset.Url);

                    updated++;
                    continue;
                }
            }

            static string GetOriginalFileName(string url)
            {
                var uri = new Uri(url);
                var name = Path.GetFileName(uri.LocalPath);
                if (string.IsNullOrWhiteSpace(name)) name = $"img_{Guid.NewGuid():N}.bin";
                return name;
            }

            var originalFileName = GetOriginalFileName(remoteUrl);

            // ✅ دانلود و ذخیره/آپلود بر اساس تنظیمات
            DownloadedMediaResult? downloaded = null;
            string finalUrl;

            byte[]? bytes = null;
            string? contentType = null;
            string? name = null;

            if (_opt.StoreDownloadedMediaLocally)
            {
                downloaded = await _downloader.DownloadToLocalAsync(
                    remoteUrl!,
                    localRootRelativeOrAbsolute: _opt.LocalMediaRoot,
                    preferredFileName: originalFileName,
                    ct: ct
                );

                finalUrl = downloaded.RelativeUrl;
                originalFileName = downloaded.StoredFileName;
            }
            else
            {
                // دانلود بایت‌ها از وردپرس
                (bytes, contentType, name) = await _downloader.DownloadBytesAsync(remoteUrl!, ct);

                // آپلود به سایت خودت => ذخیره فیزیکی روی هاست
                finalUrl = await _uploader.UploadAsync(bytes!, originalFileName, contentType!, ct);
                name = originalFileName;
            }


            if (asset == null)
            {
                asset = new MediaAsset
                {
                    Id = mediaInternalId,
                    FileName = originalFileName
                };
                _db.MediaAssets.Add(asset);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(asset.FileName))
                    asset.FileName = originalFileName;
            }

            // ✅ ذخیره URL محلی
            asset.Url = finalUrl;
            asset.ThumbnailUrl = null;
            asset.AltText = media.alt_text ?? media.title?.rendered;
            asset.Kind = MediaKind.Image;
            asset.Provider = MediaProvider.Upload;
            asset.Usage = MediaUsage.General;
            asset.FileSize = _opt.StoreDownloadedMediaLocally ? downloaded!.FileSize : bytes!.LongLength;
            asset.ContentType = _opt.StoreDownloadedMediaLocally ? downloaded!.ContentType : contentType!;

            // ✅ نسبت دادن به پست
            post.ThumbnailMediaId = asset.Id;

            // اگر فیلدهای دیگر هم هست
            TrySetGuid(post, "FeaturedMediaId", asset.Id);
            TrySetGuid(post, "ThumbnailMediaId", asset.Id);

            // ✅ این‌ها باید URL محلی باشند (نه nobelfarm)
            TrySetString(post, "FeaturedImageUrl", finalUrl);
            TrySetString(post, "ThumbnailUrl", finalUrl);
            TrySetString(post, "ThumbnailImageUrl", finalUrl);

            updated++;
        }


        await _db.SaveChangesAsync(ct);
        Console.WriteLine($"✅ Blog images imported & linked for {updated} posts.");
    }

    private static void TrySetGuid(object target, string propertyName, Guid value)
    {
        var prop = target.GetType().GetProperty(propertyName);
        if (prop == null) return;
        if (prop.PropertyType == typeof(Guid) || prop.PropertyType == typeof(Guid?))
            prop.SetValue(target, value);
    }

    private static void TrySetString(object target, string propertyName, string value)
    {
        var prop = target.GetType().GetProperty(propertyName);
        if (prop == null) return;
        if (prop.PropertyType == typeof(string))
            prop.SetValue(target, value);
    }
}

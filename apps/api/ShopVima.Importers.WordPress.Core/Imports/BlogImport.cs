using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Entities;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Wp;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;
using System.Net;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class BlogImport
{
    private readonly WpClient _wp;
    private readonly ShopDbContext _db;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;

    public BlogImport(WpClient wp, ShopDbContext db, WordPressImportOptions opt, ExternalMapService map)
    {
        _wp = wp; _db = db; _opt = opt; _map = map;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var provider = _opt.Provider;

        var cats = await _wp.GetPagedAsync<WpCategoryDto>("/wp-json/wp/v2/categories",
            query: new Dictionary<string, string> { ["_embed"] = "1" },
            ct: ct);

        var tags = await _wp.GetPagedAsync<WpTagDto>("/wp-json/wp/v2/tags",
            query: new Dictionary<string, string> { ["_embed"] = "1" },
            ct: ct);

        var posts = await _wp.GetPagedAsync<WpPostDto>(
            "/wp-json/wp/v2/posts",
            query: new Dictionary<string, string> { ["_embed"] = "1" },
            ct: ct
        );

        // Categories
        foreach (var c in cats)
        {
            if (string.IsNullOrWhiteSpace(c.slug) || string.IsNullOrWhiteSpace(c.name)) continue;

            var id = await _map.GetOrCreateInternalIdAsync(provider, "BlogCategory", c.id.ToString(), c.slug, ct);

            var entity = await _db.BlogCategories.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null)
            {
                entity = new BlogCategory { Id = id };
                _db.BlogCategories.Add(entity);
            }

            entity.Name = c.name!;
            entity.Slug = c.slug!;
        }
        await _db.SaveChangesAsync(ct);

        // Tags
        foreach (var t in tags)
        {
            if (string.IsNullOrWhiteSpace(t.slug) || string.IsNullOrWhiteSpace(t.name)) continue;

            var id = await _map.GetOrCreateInternalIdAsync(provider, "BlogTag", t.id.ToString(), t.slug, ct);

            var entity = await _db.BlogTags.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null)
            {
                entity = new BlogTag { Id = id };
                _db.BlogTags.Add(entity);
            }

            entity.Name = t.name!;
            entity.Slug = t.slug!;
        }
        await _db.SaveChangesAsync(ct);

        // Posts
        foreach (var p in posts)
        {
            if (string.IsNullOrWhiteSpace(p.slug)) continue;

            var postId = await _map.GetOrCreateInternalIdAsync(provider, "BlogPost", p.id.ToString(), p.slug, ct);

            var post = await _db.BlogPosts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == postId, ct);
            if (post == null)
            {
                post = new BlogPost { Id = postId };
                _db.BlogPosts.Add(post);
            }

            post.Slug = p.slug!;
            post.Title = (p.title?.rendered ?? p.slug!).Trim();
            post.ContentHtml = p.content?.rendered ?? "";
            post.CreatedAtUtc = p.date ?? DateTime.Now;
            post.UpdatedAtUtc = p.modified;

            string? metaTitle = p.rank_math_title;
            if (string.IsNullOrWhiteSpace(metaTitle) || metaTitle.Contains("%title%"))
                metaTitle = "";

            post.Seo.MetaTitle = WebUtility.HtmlDecode(metaTitle).Trim();

            string? metaDesc = p.rank_math_description;
            if (string.IsNullOrWhiteSpace(metaDesc) || metaDesc.Contains("%excerpt%"))
                metaDesc = "";

            post.Seo.MetaDescription = WebUtility.HtmlDecode(metaDesc).Trim();

            // ری‌لینک دسته/تگ (پاک و دوباره بساز)
            await _db.BlogPostCategories.Where(x => x.PostId == post.Id).ExecuteDeleteAsync(ct);
            await _db.BlogPostTags.Where(x => x.PostId == post.Id).ExecuteDeleteAsync(ct);

            if (p.categories != null)
            {
                foreach (var cid in p.categories)
                {
                    var map = await _map.FindAsync(provider, "BlogCategory", cid.ToString(), ct);
                    if (map != null)
                        _db.BlogPostCategories.Add(new BlogPostCategory { PostId = post.Id, CategoryId = map.InternalId });
                }
            }

            if (p.tags != null)
            {
                foreach (var tid in p.tags)
                {
                    var map = await _map.FindAsync(provider, "BlogTag", tid.ToString(), ct);
                    if (map != null)
                        _db.BlogPostTags.Add(new BlogPostTag { PostId = post.Id, TagId = map.InternalId });
                }
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}
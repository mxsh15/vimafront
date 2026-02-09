using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Woo;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;
using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class ProductsImport
{
    private readonly WooClient _woo;
    private readonly ShopDbContext _db;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;
    private readonly MediaDownloadService _downloader;
    private readonly MediaUploadClient _uploader;
    private readonly RankMathClient _rankMath;
    private readonly ILogger<ProductsImport> _log;

    public ProductsImport(
        WooClient woo,
        ShopDbContext db,
        WordPressImportOptions opt,
        ExternalMapService map,
        MediaDownloadService downloader,
        MediaUploadClient uploader,
        RankMathClient rankMath,
        ILogger<ProductsImport> log)
    {
        _woo = woo;
        _db = db;
        _opt = opt;
        _map = map;
        _downloader = downloader;
        _uploader = uploader;
        _rankMath = rankMath;
        _log = log;
    }

    private readonly Dictionary<string, Guid> _mediaIdCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly SemaphoreSlim _mediaMapLock = new(1, 1);

    private const string WooAttributeSetName = "WooCommerce (Imported)";
    private const string WooAttributeGroupName = "ویژگی‌های ووکامرس";

    private AttributeSet? _wooAttrSetCache;
    private AttributeGroup? _wooAttrGroupCache;

    private readonly Dictionary<string, Guid> _attrInternalIdCache = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<(Guid attrId, string value), Guid> _optionIdCache = new();

    private Vendor? _providerVendorCache;
    private readonly Dictionary<string, Guid> _attrIdCache = new(StringComparer.OrdinalIgnoreCase);

    private AttributeGroup? _defaultVarAttrGroupCache;

    private static string NormalizeImageUrl(string url)
    {
        url = url.Trim();
        if (Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return uri.GetLeftPart(UriPartial.Path);
        var q = url.IndexOf('?');
        if (q >= 0) url = url[..q];
        var h = url.IndexOf('#');
        if (h >= 0) url = url[..h];
        return url;
    }

    private async Task<Guid> SafeGetOrCreateMediaIdAsync(string provider, string externalId, CancellationToken ct)
    {
        externalId = externalId.Trim();

        if (_mediaIdCache.TryGetValue(externalId, out var cached))
            return cached;

        // 1) اول Find از DB
        var existing = await _map.FindAsync(provider, "Media", externalId, ct);
        if (existing != null)
        {
            _mediaIdCache[externalId] = existing.InternalId;
            return existing.InternalId;
        }

        // 2) برای جلوگیری از race داخل یک اجرا
        await _mediaMapLock.WaitAsync(ct);
        try
        {
            // دوباره چک کن (double-check)
            existing = await _map.FindAsync(provider, "Media", externalId, ct);
            if (existing != null)
            {
                _mediaIdCache[externalId] = existing.InternalId;
                return existing.InternalId;
            }

            // 3) ایجاد (ممکن است سرویس شما insert بزند)
            try
            {
                var createdId = await _map.GetOrCreateInternalIdAsync(provider, "Media", externalId, slug: null, ct);
                _mediaIdCache[externalId] = createdId;
                return createdId;
            }
            catch (DbUpdateException)
            {
                // اگر همزمان درج شده باشد، دوباره از DB بخوان
                existing = await _map.FindAsync(provider, "Media", externalId, ct);
                if (existing != null)
                {
                    _mediaIdCache[externalId] = existing.InternalId;
                    return existing.InternalId;
                }
                throw;
            }
        }
        finally
        {
            _mediaMapLock.Release();
        }
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var provider = _opt.Provider;
        var apiPrefix = _opt.Woo.ApiPrefix.TrimEnd('/');

        _log.LogInformation("[ProductsImport] START provider={Provider} baseUrl={BaseUrl} apiPrefix={ApiPrefix}",
            provider, _opt.BaseUrl, apiPrefix);

        const int apiPerPage = 100;
        const int saveBatchSize = 200;

        var page = 1;
        var buffer = new List<WooProductDto>(capacity: saveBatchSize);

        while (true)
        {
            var items = await _woo.GetPageAsync<WooProductDto>($"{apiPrefix}/products", page, apiPerPage, ct);

            _log.LogInformation("[ProductsImport] fetched page={Page} items={Count}", page, items.Count);

            if (items.Count == 0)
            {
                _log.LogWarning("[ProductsImport] STOP paging because items=0 at page={Page}", page);
                break;
            }

            var variableCount = items.Count(x => string.Equals(x.type, "variable", StringComparison.OrdinalIgnoreCase));
            _log.LogInformation("[ProductsImport] page={Page} variableParents={VarCount}", page, variableCount);

            buffer.AddRange(items);

            while (buffer.Count >= saveBatchSize)
            {
                var batch = buffer.Take(saveBatchSize).ToList();
                buffer.RemoveRange(0, saveBatchSize);

                _log.LogInformation("[ProductsImport] processing batch size={Size}", batch.Count);

                //await FixProductDatesBatchOnlyAsync(provider, batch, ct);
                await ImportVariableProductsBatchOnlyAsync(provider, batch, ct);

                var changed = _db.ChangeTracker.Entries().Count(e => e.State != EntityState.Unchanged);
                _log.LogInformation("[ProductsImport] ChangeTracker changedEntries={Changed}", changed);

                try
                {
                    await _db.SaveChangesAsync(ct);
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    _log.LogError(ex, "[SaveChanges] Concurrency exception. Entries={Count}", ex.Entries.Count);

                    foreach (var entry in ex.Entries)
                    {
                        _log.LogError("[Concurrency] Entity={Entity} State={State}",
                            entry.Metadata.Name, entry.State);

                        // کلیدها (Id و ...)
                        var keys = entry.Properties.Where(p => p.Metadata.IsPrimaryKey())
                            .Select(p => $"{p.Metadata.Name}={p.CurrentValue}")
                            .ToArray();

                        _log.LogError("[Concurrency] Keys: {Keys}", string.Join(", ", keys));

                        // وضعیت DB
                        var dbValues = await entry.GetDatabaseValuesAsync(ct);
                        if (dbValues == null)
                        {
                            _log.LogError("[Concurrency] Entity not found in DB (deleted).");
                        }
                        else
                        {
                            var dbRowVersion = dbValues.Properties
                                .FirstOrDefault(p => p.Name == "RowVersion") != null
                                ? dbValues["RowVersion"]
                                : null;

                            var curRowVersion = entry.Properties
                                .FirstOrDefault(p => p.Metadata.Name == "RowVersion")?.CurrentValue;

                            _log.LogError("[Concurrency] RowVersion Current={Cur} DB={Db}",
                                ToHex(curRowVersion as byte[]), ToHex(dbRowVersion as byte[]));
                        }
                    }

                    throw;
                }

                static string? ToHex(byte[]? bytes)
                {
                    if (bytes == null) return null;
                    return "0x" + BitConverter.ToString(bytes).Replace("-", "");
                }

                _db.ChangeTracker.Clear();
            }

            page++;
        }

        if (buffer.Count > 0)
        {
            _log.LogInformation("[ProductsImport] final batch size={Size}", buffer.Count);

            //await FixProductDatesBatchOnlyAsync(provider, buffer, ct);
            await ImportVariableProductsBatchOnlyAsync(provider, buffer, ct);

            var changed = _db.ChangeTracker.Entries().Count(e => e.State != EntityState.Unchanged);
            _log.LogInformation("[ProductsImport] ChangeTracker changedEntries={Changed}", changed);

            try
            {
                await _db.SaveChangesAsync(ct);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _log.LogError(ex, "[SaveChanges] Concurrency exception. Entries={Count}", ex.Entries.Count);

                foreach (var entry in ex.Entries)
                {
                    _log.LogError("[Concurrency] Entity={Entity} State={State}",
                        entry.Metadata.Name, entry.State);

                    // کلیدها (Id و ...)
                    var keys = entry.Properties.Where(p => p.Metadata.IsPrimaryKey())
                        .Select(p => $"{p.Metadata.Name}={p.CurrentValue}")
                        .ToArray();

                    _log.LogError("[Concurrency] Keys: {Keys}", string.Join(", ", keys));

                    // وضعیت DB
                    var dbValues = await entry.GetDatabaseValuesAsync(ct);
                    if (dbValues == null)
                    {
                        _log.LogError("[Concurrency] Entity not found in DB (deleted).");
                    }
                    else
                    {
                        var dbRowVersion = dbValues.Properties
                            .FirstOrDefault(p => p.Name == "RowVersion") != null
                            ? dbValues["RowVersion"]
                            : null;

                        var curRowVersion = entry.Properties
                            .FirstOrDefault(p => p.Metadata.Name == "RowVersion")?.CurrentValue;

                        _log.LogError("[Concurrency] RowVersion Current={Cur} DB={Db}",
                            ToHex(curRowVersion as byte[]), ToHex(dbRowVersion as byte[]));
                    }
                }

                throw;
            }

            static string? ToHex(byte[]? bytes)
            {
                if (bytes == null) return null;
                return "0x" + BitConverter.ToString(bytes).Replace("-", "");
            }

            _db.ChangeTracker.Clear();
        }

        _log.LogInformation("[ProductsImport] END");
    }

    private async Task ImportImagesBatchOnlyAsync(string provider, List<WooProductDto> products, CancellationToken ct)
    {
        foreach (var p in products)
        {
            // فقط برای محصولاتی که در وو slug دارند
            if (string.IsNullOrWhiteSpace(p.slug)) continue;

            // مپ: Woo ProductId -> Product.Id داخلی
            var productId = await _map.GetOrCreateInternalIdAsync(provider, "Product", p.id.ToString(), p.slug, ct);

            // ✅ اگر می‌خوای فقط برای محصولاتی که قبلاً تو DB هستند عکس بزنه:
            var product = await _db.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == productId, ct);

            if (product == null)
            {
                // اگر “فقط آپدیت” می‌خوای، این خط را فعال کن و ادامه بده:
                // continue;

                // اگر ok هست محصول هم در صورت نبود ساخته شود:
                product = new Product { Id = productId, Slug = p.slug.Trim(), Title = (p.name ?? p.slug).Trim() };
                _db.Products.Add(product);
            }

            // -----------------------------
            // همه چیزهای غیر از عکس کامنت شد
            // -----------------------------
            // product.Title = (p.name ?? p.slug!).Trim();
            // product.Slug = p.slug!.Trim();
            // product.Sku = string.IsNullOrWhiteSpace(p.sku) ? null : p.sku.Trim();
            // product.DescriptionHtml = p.description ?? "";
            // product.Status = ProductStatus.Published;
            // product.Visibility = ProductVisibility.PublicCatalog;

            // --- SEO (کامنت برای سرعت)
            // await ApplyProductSeoAsync(product, p, ct);

            // --- categories relationship (کامنت برای سرعت)
            // await _db.ProductCategoryAssignments.Where(x => x.ProductId == product.Id).ExecuteDeleteAsync(ct);
            // ...

            // --- tags relationship (کامنت برای سرعت)
            // await _db.ProductTags.Where(x => x.ProductId == product.Id).ExecuteDeleteAsync(ct);
            // ...

            // ✅ فقط عکس‌ها
            await ImportProductMediaAsync(product, p, ct);
        }
    }

    private async Task ImportProductMediaAsync(Product product, WooProductDto dto, CancellationToken ct)
    {
        if (dto.images == null || dto.images.Count == 0) return;

        // پاک کردن گالری قبلی محصول
        await _db.ProductMedia.Where(x => x.ProductId == product.Id).ExecuteDeleteAsync(ct);

        // ✅ اینجا قرار بده (قبل از حلقه)
        var images = dto.images
            .Where(x => !string.IsNullOrWhiteSpace(x.src))
            .GroupBy(x => NormalizeImageUrl(x.src!))
            .Select(g => g.First())
            .ToList();

        for (int i = 0; i < images.Count; i++)
        {
            var img = images[i];
            var remoteUrl = img.src!;
            var isPrimary = i == 0;
            var alt = string.IsNullOrWhiteSpace(img.alt) ? dto.name : img.alt;

            var (_, finalUrl) = await UpsertProductMediaAssetAsync(
                productId: product.Id,
                remoteUrl: remoteUrl,
                altText: alt,
                sortOrder: i,
                isPrimary: isPrimary,
                ct: ct);

            _db.ProductMedia.Add(new ProductMedia
            {
                ProductId = product.Id,
                Kind = MediaKind.Image,
                Provider = MediaProvider.Upload,
                Url = finalUrl,
                ThumbnailUrl = null,
                AltText = alt,
                SortOrder = i,
                IsPrimary = isPrimary
            });
        }
    }

    private async Task<(MediaAsset asset, string finalUrl)> UpsertProductMediaAssetAsync(
        Guid productId,
        string remoteUrl,
        string? altText,
        int sortOrder,
        bool isPrimary,
        CancellationToken ct)
    {
        var provider = _opt.Provider;

        // چون Woo image id نداریم، کلید را URL می‌گذاریم تا تکراری نشود
        var externalId = NormalizeImageUrl(remoteUrl);

        var mediaInternalId = await SafeGetOrCreateMediaIdAsync(provider, externalId, ct);

        // ✅ اگر همین Id قبلاً در همین DbContext track شده، همون رو بگیر
        var tracked = _db.MediaAssets.Local.FirstOrDefault(x => x.Id == mediaInternalId);
        if (tracked != null)
        {
            var finalUrlExisting = tracked.Url;
        }

        var asset =
            _db.MediaAssets.Local.FirstOrDefault(x => x.Id == mediaInternalId)
            ?? await _db.MediaAssets.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == mediaInternalId, ct);

        // اگر از قبل url محلی دارد و فایل هم موجود است، دانلود تکراری نکن
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
                    static string ToAbsPath(string localMediaRoot, string url)
                    {
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
                asset.RelatedEntityType = "Product";
                asset.RelatedEntityId = productId;
                asset.SortOrder = sortOrder;
                asset.IsPrimary = isPrimary;
                asset.AltText = altText;

                return (asset, asset.Url);
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

        DownloadedMediaResult? downloaded = null;
        string finalUrl;

        byte[]? bytes = null;
        string? contentType = null;

        if (_opt.StoreDownloadedMediaLocally)
        {
            downloaded = await _downloader.DownloadToLocalAsync(
                remoteUrl,
                localRootRelativeOrAbsolute: _opt.LocalMediaRoot,
                preferredFileName: originalFileName,
                ct: ct);

            finalUrl = downloaded.RelativeUrl;
            originalFileName = downloaded.StoredFileName;
            contentType = downloaded.ContentType;
        }
        else
        {
            (bytes, contentType, _) = await _downloader.DownloadBytesAsync(remoteUrl, ct);
            finalUrl = await _uploader.UploadAsync(bytes!, originalFileName, contentType!, ct);
        }

        if (asset == null)
        {
            asset = _db.MediaAssets.Local.FirstOrDefault(x => x.Id == mediaInternalId);

            if (asset == null)
            {
                asset = new MediaAsset
                {
                    Id = mediaInternalId,
                    FileName = originalFileName
                };
                _db.MediaAssets.Add(asset);
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(asset.FileName))
                asset.FileName = originalFileName;
        }

        asset.Url = finalUrl;
        asset.ThumbnailUrl = null;
        asset.AltText = altText;
        asset.Kind = MediaKind.Image;
        asset.Provider = MediaProvider.Upload;
        asset.Usage = MediaUsage.General;
        asset.FileSize = _opt.StoreDownloadedMediaLocally ? downloaded!.FileSize : bytes!.LongLength;
        asset.ContentType = _opt.StoreDownloadedMediaLocally ? downloaded!.ContentType : contentType!;

        asset.RelatedEntityType = "Product";
        asset.RelatedEntityId = productId;
        asset.SortOrder = sortOrder;
        asset.IsPrimary = isPrimary;

        return (asset, finalUrl);
    }


    private static DateTime? TryGetWooDateUtc(object dto, params string[] names)
    {
        foreach (var name in names)
        {
            var prop = dto.GetType().GetProperty(name);
            if (prop == null) continue;

            var value = prop.GetValue(dto);
            if (value == null) continue;

            // اگر خود DateTime بود
            if (value.GetType() == typeof(DateTime))
            {
                var dt = (DateTime)value;
                return EnsureUtc(dt);
            }

            // اگر Nullable<DateTime> بود (به عنوان object می‌آید)
            if (value is DateTime dt2)
            {
                return EnsureUtc(dt2);
            }

            // اگر string بود
            var s = value as string;
            if (!string.IsNullOrWhiteSpace(s))
            {
                if (DateTimeOffset.TryParse(s, out var dtoff))
                    return dtoff.UtcDateTime;

                if (DateTime.TryParse(s, out var dt3))
                    return EnsureUtc(dt3);
            }
        }

        return null;
    }

    private static DateTime EnsureUtc(DateTime dt)
    {
        return dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }

    private async Task FixProductDatesBatchOnlyAsync(string provider, List<WooProductDto> products, CancellationToken ct)
    {
        foreach (var p in products)
        {
            if (string.IsNullOrWhiteSpace(p.slug))
                continue;

            // ✅ تاریخ درست‌تر: GMT
            var createdUtc = p.date_created_gmt ?? p.date_created;
            var modifiedUtc = p.date_modified_gmt ?? p.date_modified;

            if (!createdUtc.HasValue && !modifiedUtc.HasValue)
                continue;

            // ✅ چون قبلاً مشکل map داشتی، از slug برای پیدا کردن محصول DB استفاده کن
            var product = await _db.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Slug == p.slug, ct);

            if (product == null)
                continue;

            var q = _db.Products.IgnoreQueryFilters().Where(x => x.Id == product.Id);

            if (createdUtc.HasValue && modifiedUtc.HasValue)
            {
                await q.ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.CreatedAtUtc, DateTime.SpecifyKind(createdUtc.Value, DateTimeKind.Utc))
                    .SetProperty(x => x.UpdatedAtUtc, DateTime.SpecifyKind(modifiedUtc.Value, DateTimeKind.Utc)), ct);
            }
            else if (createdUtc.HasValue)
            {
                await q.ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.CreatedAtUtc, DateTime.SpecifyKind(createdUtc.Value, DateTimeKind.Utc)), ct);
            }
            else
            {
                await q.ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.UpdatedAtUtc, DateTime.SpecifyKind(modifiedUtc.Value, DateTimeKind.Utc)), ct);
            }
        }
    }

    private async Task ImportProductAttributesBatchOnlyAsync(string provider, List<WooProductDto> products, CancellationToken ct)
    {
        var (set, group) = await EnsureWooAttributeSetAndGroupAsync(ct);
        var apiPrefix = _opt.Woo.ApiPrefix.TrimEnd('/');
        var globalAttrs = await _woo.GetPagedAsync<WooAttrDto>($"{apiPrefix}/products/attributes", perPage: 100, ct: ct);
        var globalById = globalAttrs
            .Where(x => x.id > 0)
            .GroupBy(x => x.id)
            .ToDictionary(g => g.Key, g => g.First());

        foreach (var dto in products)
        {
            if (string.IsNullOrWhiteSpace(dto.slug)) continue;
            if (dto.attributes == null || dto.attributes.Count == 0) continue;

            var product = await _db.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Slug == dto.slug, ct);

            if (product == null) continue;

            await _db.ProductAttributeValues
                .Where(x => x.ProductId == product.Id)
                .ExecuteDeleteAsync(ct);

            var displayOrder = 0;

            foreach (var a in dto.attributes)
            {
                var attrName = (a.name ?? "").Trim();
                if (string.IsNullOrWhiteSpace(attrName)) continue;

                // global وو: a.id > 0
                // custom: a.id == 0
                WooAttrDto? global = null;
                if (a.id > 0 && globalById.TryGetValue(a.id, out var g)) global = g;

                var key = BuildAttributeKey(a, global);
                var externalId = BuildAttributeExternalId(a, global);

                // Upsert Attribute
                var attrEntity = await GetOrCreateProductAttributeAsync(
                    provider: provider,
                    externalId: externalId,
                    key: key,
                    name: global?.name?.Trim() ?? attrName,
                    groupId: group.Id,
                    isVariantLevel: a.variation,
                    valueType: InferValueType(a),
                    ct: ct);

                var options = a.options ?? new List<string>();
                if (options.Count == 0)
                {
                    // اگر گزینه‌ای نبود، یک مقدار خالی هم ذخیره نمی‌کنیم
                    continue;
                }

                // برای هر گزینه/مقدار یک ردیف ProductAttributeValue می‌زنیم
                foreach (var opt in options.Select(x => (x ?? "").Trim()).Where(x => !string.IsNullOrWhiteSpace(x)))
                {
                    var pav = new ProductAttributeValue
                    {
                        ProductId = product.Id,
                        AttributeId = attrEntity.Id,
                        AttributeGroupId = group.Id,
                        DisplayOrder = displayOrder++
                    };

                    if (attrEntity.ValueType is AttributeValueType.Option or AttributeValueType.MultiOption)
                    {
                        var optionId = await GetOrCreateOptionAsync(attrEntity.Id, opt, ct);
                        pav.OptionId = optionId;
                        pav.RawValue = opt; // برای نمایش/دیباگ هم خوبه
                    }
                    else
                    {
                        pav.RawValue = opt;
                        if (TryParseDecimal(opt, out var num))
                            pav.NumericValue = num;
                    }

                    _db.ProductAttributeValues.Add(pav);
                }
            }
        }
    }

    private async Task<(AttributeSet set, AttributeGroup group)> EnsureWooAttributeSetAndGroupAsync(CancellationToken ct)
    {
        if (_wooAttrSetCache != null && _wooAttrGroupCache != null)
            return (_wooAttrSetCache, _wooAttrGroupCache);

        var set = await _db.AttributeSets
            .Include(x => x.Groups)
            .FirstOrDefaultAsync(x => x.Name == WooAttributeSetName, ct);

        if (set == null)
        {
            set = new AttributeSet
            {
                Name = WooAttributeSetName,
                Description = "AttributeSet ساخته‌شده برای انتقال ویژگی‌های محصولات از WooCommerce"
            };
            _db.AttributeSets.Add(set);
            await _db.SaveChangesAsync(ct);
        }

        var group = await _db.AttributeGroups
            .FirstOrDefaultAsync(x => x.AttributeSetId == set.Id && x.Name == WooAttributeGroupName, ct);

        if (group == null)
        {
            group = new AttributeGroup
            {
                AttributeSetId = set.Id,
                Name = WooAttributeGroupName,
                SortOrder = 0
            };
            _db.AttributeGroups.Add(group);
            await _db.SaveChangesAsync(ct);
        }

        _wooAttrSetCache = set;
        _wooAttrGroupCache = group;

        return (set, group);
    }

    private async Task<ProductAttribute> GetOrCreateProductAttributeAsync(
        string provider,
        string externalId,
        string key,
        string name,
        Guid groupId,
        bool isVariantLevel,
        AttributeValueType valueType,
        CancellationToken ct)
    {
 
        if (_attrInternalIdCache.TryGetValue(externalId, out var cachedId))
        {
            var cachedEntity = _db.ProductAttributes.Local.FirstOrDefault(x => x.Id == cachedId)
                ?? await _db.ProductAttributes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == cachedId, ct);

            if (cachedEntity != null) return cachedEntity;
        }


        var internalId = await _map.GetOrCreateInternalIdAsync(provider, "ProductAttribute", externalId, slug: key, ct);

        var entity = _db.ProductAttributes.Local.FirstOrDefault(x => x.Id == internalId)
            ?? await _db.ProductAttributes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == internalId, ct);

        if (entity == null)
        {
            entity = new ProductAttribute
            {
                Id = internalId
            };
            _db.ProductAttributes.Add(entity);
        }

        // آپدیت فیلدها
        entity.AttributeGroupId = groupId;
        entity.Name = name.Trim();
        entity.Key = key.Trim(); // یکتا
        entity.ValueType = valueType;
        entity.IsVariantLevel = isVariantLevel;


        if (isVariantLevel)
            entity.IsFilterable = true;

        _attrInternalIdCache[externalId] = internalId;

        return entity;
    }


    private static AttributeValueType InferValueType(WooProductAttrInProductDto a)
    {
        var cnt = a.options?.Count ?? 0;
        if (cnt <= 0) return AttributeValueType.Text;
        if (cnt == 1) return AttributeValueType.Option;
        return AttributeValueType.MultiOption;
    }

    private static string BuildAttributeExternalId(WooProductAttrInProductDto a, WooAttrDto? global)
    {
        if (a.id > 0) return $"woo_attr:{a.id}";
        var n = (a.name ?? "").Trim();
        var slug = Slugify(n);
        return $"woo_custom:{slug}";
    }

    private static string BuildAttributeKey(WooProductAttrInProductDto a, WooAttrDto? global)
    {
        // ProductAttribute.Key در DB Unique است
        // global اگر slug دارد: woo_{slug}
        // وگرنه: woo_attr_{id}
        if (a.id > 0)
        {
            var slug = (global?.slug ?? "").Trim();
            if (!string.IsNullOrWhiteSpace(slug))
                return $"woo_{slug}";
            return $"woo_attr_{a.id}";
        }

        // custom
        var name = (a.name ?? "").Trim();
        return $"woo_custom_{Slugify(name)}";
    }

    private static bool TryParseDecimal(string input, out decimal value)
    {
        value = 0;
        if (string.IsNullOrWhiteSpace(input)) return false;

        // فقط عددهای داخل متن (مثلاً "256 گیگ" -> 256)
        var m = Regex.Match(input, @"-?\d+(\.\d+)?");
        if (!m.Success) return false;

        return decimal.TryParse(m.Value, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out value);
    }

    private async Task ImportVariableProductsBatchOnlyAsync(string provider, List<WooProductDto> products, CancellationToken ct)
    {
        var apiPrefix = _opt.Woo.ApiPrefix.TrimEnd('/');

        var variableParents = products
            .Where(p => string.Equals(p.type, "variable", StringComparison.OrdinalIgnoreCase))
            .Where(p => p.id > 0)
            .ToList();

        _log.LogInformation("[VarImport] batch products={Total} variableParents={VarCount}",
            products.Count, variableParents.Count);

        if (variableParents.Count == 0) return;

        var vendor = await EnsureProviderVendorAsync(provider, ct);
        _log.LogInformation("[VarImport] vendorId={VendorId} storeName={StoreName}", vendor.Id, vendor.StoreName);

        var processed = 0;
        var skippedNoParentInDb = 0;
        var skippedNoVariations = 0;
        var totalAddedVariants = 0;

        foreach (var parent in variableParents)
        {
            _log.LogInformation("[VarImport] parent wooId={WooId} slug={Slug} name={Name}",
                parent.id, parent.slug, parent.name);

            // ✅ 1) parent را با Woo ID map پیدا کن (نه slug)
            var parentMap = await _map.FindAsync(provider, "Product", parent.id.ToString(), ct);
            if (parentMap == null)
            {
                skippedNoParentInDb++;
                _log.LogWarning("[VarImport] SKIP: no map for parent wooId={WooId}. Run product upsert first.", parent.id);
                continue;
            }

            var productId = parentMap.InternalId;

            // فقط برای خواندن می‌گیریم
            var dbProduct = await _db.Products
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == productId, ct);

            if (dbProduct == null)
            {
                skippedNoParentInDb++;
                _log.LogWarning("[VarImport] SKIP: map exists but product not found. internalId={Id}", productId);
                continue;
            }

            var offerId = await EnsureVendorOfferIdAsync(vendor.Id, dbProduct.Id, ct);
            var offerPrice = ParseWooPrice(parent.price, parent.regular_price, parent.sale_price);
            var offerDiscount = !string.IsNullOrWhiteSpace(parent.sale_price)
                ? ParseWooPrice(null, null, parent.sale_price)
                : null;

            if (offerPrice.HasValue && offerPrice.Value > 0)
            {
                await _db.VendorOffers
                    .Where(o => o.Id == offerId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.Price, offerPrice.Value)
                        .SetProperty(x => x.DiscountPrice, offerDiscount)
                        .SetProperty(x => x.UpdatedAtUtc, DateTime.UtcNow), ct);
            }


            // ✅ متغیر بودن محصول را بدون درگیری concurrency ست کن
            if (!dbProduct.IsVariantProduct)
            {
                await _db.Products
                    .Where(p => p.Id == dbProduct.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsVariantProduct, true), ct);
            }

            _log.LogInformation("[VarImport] offerId={OfferId} productId={ProductId}", offerId, dbProduct.Id);

            // ✅ 2) variations از Woo
            var variations = await _woo.GetPagedAsync<WooProductVariationDto>(
                $"{apiPrefix}/products/{parent.id}/variations",
                perPage: 100,
                ct: ct);

            _log.LogWarning("[VarImport] variations count={Count} for wooParentId={WooId}", variations.Count, parent.id);

            if (variations.Count == 0)
            {
                skippedNoVariations++;
                continue;
            }

            // ✅ 3) پاکسازی قبلی‌ها (اختیاری ولی بهتر برای idempotent)
            await _db.VendorOfferVariants
                .Where(x => x.VendorOfferId == offerId)
                .ExecuteDeleteAsync(ct);

            var oldVariantIds = _db.ProductVariants
                .Where(v => v.ProductId == dbProduct.Id)
                .Select(v => v.Id);

            await _db.ProductVariantAttributeValues
                .Where(x => oldVariantIds.Contains(x.ProductVariantId))
                .ExecuteDeleteAsync(ct);

            await _db.ProductVariants
                .Where(x => x.ProductId == dbProduct.Id)
                .ExecuteDeleteAsync(ct);

            var addedHere = 0;

            foreach (var v in variations)
            {
                _log.LogInformation("[VarImport] adding variant wooVarId={Id} parentWooId={ParentId}", v.id, parent.id);

                // ✅ internal variant id (map)
                var variantId = await _map.GetOrCreateInternalIdAsync(
                    provider,
                    "ProductVariant",
                    externalId: v.id.ToString(),
                    slug: null,
                    ct: ct);

                var variant = new ProductVariant
                {
                    Id = variantId,
                    ProductId = dbProduct.Id,
                    VariantCode = !string.IsNullOrWhiteSpace(v.sku) ? v.sku!.Trim() : $"woo-var-{v.id}",
                };

                _db.ProductVariants.Add(variant);

                // attributes -> ProductVariantAttributeValues
                if (v.attributes != null && v.attributes.Count > 0)
                {
                    var order = 0;
                    foreach (var a in v.attributes)
                    {
                        var attrName = (a.name ?? "").Trim();
                        var opt = (a.option ?? "").Trim();
                        if (string.IsNullOrWhiteSpace(attrName) || string.IsNullOrWhiteSpace(opt))
                            continue;

                        // این 2 متد باید در پروژه‌ات وجود داشته باشد (یا منطق معادلش)
                        var attr = await GetOrCreateVariantAttributeAsync(provider, a, ct);
                        var optionId = await GetOrCreateOptionAsync(attr.Id, opt, ct);

                        _db.ProductVariantAttributeValues.Add(new ProductVariantAttributeValue
                        {
                            ProductVariantId = variant.Id,
                            AttributeId = attr.Id,
                            OptionId = optionId,
                            RawValue = opt,
                            DisplayOrder = order++
                        });
                    }
                }

                // قیمت / موجودی
                var price = ParseDecimalOrNull(v.price)
                            ?? ParseDecimalOrNull(v.sale_price)
                            ?? ParseDecimalOrNull(v.regular_price)
                            ?? 0m;

                var regular = ParseDecimalOrNull(v.regular_price);
                var sale = ParseDecimalOrNull(v.sale_price);

                _db.VendorOfferVariants.Add(new VendorOfferVariant
                {
                    VendorOfferId = offerId,
                    ProductVariantId = variant.Id,

                    Sku = !string.IsNullOrWhiteSpace(v.sku) ? v.sku!.Trim() : variant.VariantCode,

                    Price = regular ?? price,
                    DiscountPrice = sale,

                    ManageStock = v.manage_stock ?? false,
                    StockStatus = MapStockStatus(v.stock_status),
                    StockQuantity = v.stock_quantity ?? 0,

                    WeightKg = ParseDecimalOrNull(v.weight),
                    LengthCm = ParseDecimalOrNull(v.dimensions?.length),
                    WidthCm = ParseDecimalOrNull(v.dimensions?.width),
                    HeightCm = ParseDecimalOrNull(v.dimensions?.height),

                    Description = v.description
                });

                addedHere++;
            }

            totalAddedVariants += addedHere;
            processed++;

            _log.LogInformation("[VarImport] parent wooId={WooId} addedVariants={Added}", parent.id, addedHere);
        }

        _log.LogInformation("[VarImport] DONE processed={Processed} totalAddedVariants={TotalAdded} skippedNoParentInDb={Skipped1} skippedNoVariations={Skipped2}",
            processed, totalAddedVariants, skippedNoParentInDb, skippedNoVariations);
    }


    private async Task<Vendor> EnsureProviderVendorAsync(string provider, CancellationToken ct)
    {
        if (_providerVendorCache != null) return _providerVendorCache;

        var storeName = provider.Trim();
        var existing = await _db.Vendors.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.StoreName == storeName, ct);

        if (existing != null)
        {
            _providerVendorCache = existing;
            return existing;
        }

        var v = new Vendor
        {
            StoreName = storeName,
            LegalName = storeName
        };
        _db.Vendors.Add(v);
        await _db.SaveChangesAsync(ct);

        _providerVendorCache = v;
        return v;
    }

    private async Task<VendorOffer> EnsureVendorOfferAsync(Guid vendorId, Guid productId, CancellationToken ct)
    {
        var offer = await _db.VendorOffers.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.VendorId == vendorId && x.ProductId == productId, ct);

        if (offer != null) return offer;

        offer = new VendorOffer
        {
            VendorId = vendorId,
            ProductId = productId,
            SaleModel = ProductSaleModel.OnlinePricing,
            Price = 0,
            DiscountPrice = null,
            ManageStock = false,
            StockStatus = StockStatus.InStock,
            StockQuantity = 0,
            BackorderPolicy = BackorderPolicy.DoNotAllow,
            LowStockThreshold = null,
            IsDefaultForProduct = true,
            Status = VendorOfferStatus.Pending
        };
        _db.VendorOffers.Add(offer);
        await _db.SaveChangesAsync(ct);
        return offer;
    }

    private async Task<ProductAttribute> GetOrCreateVariantAttributeAsync(string provider, WooVariationAttributeDto a, CancellationToken ct)
    {
        // key یکتا بساز
        var name = (a.name ?? "").Trim();
        var key = a.id > 0 ? $"woo_var_attr_{a.id}" : $"woo_var_attr_{Slugify(name)}";
        var externalId = a.id > 0 ? $"woo_attr:{a.id}" : $"woo_custom:{Slugify(name)}";

        if (_attrIdCache.TryGetValue(externalId, out var cachedId))
        {
            var cached = await _db.ProductAttributes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == cachedId, ct);
            if (cached != null) return cached;
        }

        var internalId = await _map.GetOrCreateInternalIdAsync(provider, "ProductAttribute", externalId, slug: key, ct);

        var entity = await _db.ProductAttributes.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == internalId, ct);
        if (entity == null)
        {
            entity = new ProductAttribute { Id = internalId };
            _db.ProductAttributes.Add(entity);
        }

        var group = await EnsureDefaultVariantAttributeGroupAsync(ct);

        entity.AttributeGroupId = group.Id;
        entity.Name = name;
        entity.Key = key;
        entity.ValueType = AttributeValueType.Option;
        entity.IsVariantLevel = true;
        entity.IsFilterable = true;

        _attrIdCache[externalId] = internalId;
        return entity;
    }

    private async Task<AttributeGroup> EnsureDefaultVariantAttributeGroupAsync(CancellationToken ct)
    {
        if (_defaultVarAttrGroupCache != null) return _defaultVarAttrGroupCache;

        const string setName = "Woo Variants";
        const string groupName = "ویژگی‌های متغیر";

        var set = await _db.AttributeSets.Include(x => x.Groups)
            .FirstOrDefaultAsync(x => x.Name == setName, ct);

        if (set == null)
        {
            set = new AttributeSet { Name = setName, Description = "برای ویژگی‌های variation ووکامرس" };
            _db.AttributeSets.Add(set);
            await _db.SaveChangesAsync(ct);
        }

        var group = await _db.AttributeGroups.FirstOrDefaultAsync(x => x.AttributeSetId == set.Id && x.Name == groupName, ct);
        if (group == null)
        {
            group = new AttributeGroup { AttributeSetId = set.Id, Name = groupName, SortOrder = 0 };
            _db.AttributeGroups.Add(group);
            await _db.SaveChangesAsync(ct);
        }

        _defaultVarAttrGroupCache = group;
        return group;
    }

    private async Task<Guid> GetOrCreateOptionAsync(Guid attributeId, string value, CancellationToken ct)
    {
        var k = (attributeId, value);
        if (_optionIdCache.TryGetValue(k, out var cached)) return cached;

        var existing = await _db.AttributeOptions.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.AttributeId == attributeId && x.Value == value, ct);

        if (existing != null)
        {
            _optionIdCache[k] = existing.Id;
            return existing.Id;
        }

        var opt = new AttributeOption
        {
            AttributeId = attributeId,
            Value = value,
            DisplayLabel = value,
            SortOrder = 0,
            IsDefault = false
        };

        _db.AttributeOptions.Add(opt);
        await _db.SaveChangesAsync(ct);

        _optionIdCache[k] = opt.Id;
        return opt.Id;
    }

    private static StockStatus MapStockStatus(string? stockStatus)
    {
        return stockStatus?.Trim().ToLowerInvariant() switch
        {
            "outofstock" => StockStatus.OutOfStock,
            "onbackorder" => StockStatus.OnBackorder,
            _ => StockStatus.InStock
        };
    }

    private static decimal? ParseDecimalOrNull(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        s = s.Trim();

        if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return d;

        // اگر با / یا , یا متن برگشت
        var cleaned = new string(s.Where(c => char.IsDigit(c) || c == '.' || c == '-' || c == ',').ToArray())
            .Replace(",", ".");
        if (decimal.TryParse(cleaned, NumberStyles.Any, CultureInfo.InvariantCulture, out d))
            return d;

        return null;
    }

    private static string Slugify(string input)
    {
        input = (input ?? "").Trim().ToLowerInvariant();
        input = input.Replace('‌', ' '); // نیم‌فاصله
        input = System.Text.RegularExpressions.Regex.Replace(input, @"\s+", "-");
        input = System.Text.RegularExpressions.Regex.Replace(input, @"[^a-z0-9\u0600-\u06FF\-]+", "");
        input = System.Text.RegularExpressions.Regex.Replace(input, @"\-{2,}", "-").Trim('-');
        return string.IsNullOrWhiteSpace(input) ? "attr" : (input.Length <= 60 ? input : input[..60]);
    }

    private async Task<Guid> EnsureVendorOfferIdAsync(Guid vendorId, Guid productId, CancellationToken ct)
    {
        // 1) اگر offer قبلاً هست، فقط Id را برگردان
        var existingId = await _db.VendorOffers
            .IgnoreQueryFilters()
            .Where(x => x.VendorId == vendorId && x.ProductId == productId)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(ct);

        if (existingId != Guid.Empty)
            return existingId;

        // 2) اگر در همین DbContext قبلاً Add شده ولی Save نشده
        var local = _db.VendorOffers.Local
            .FirstOrDefault(x => x.VendorId == vendorId && x.ProductId == productId);

        if (local != null)
            return local.Id;

        _log.LogInformation("[Offer] creating vendorOffer vendorId={VendorId} productId={ProductId}", vendorId, productId);

        var offer = new VendorOffer
        {
            Id = Guid.NewGuid(),
            VendorId = vendorId,
            ProductId = productId,
            Status = VendorOfferStatus.Approved,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
        };

        _db.VendorOffers.Add(offer);

        // ❌ مهم: اینجا SaveChanges نزن
        return offer.Id;
    }


    private static bool IsUniqueKeyViolation(DbUpdateException ex)
    {
        // SQL Server: 2601 or 2627
        if (ex.InnerException is SqlException sqlEx)
            return sqlEx.Number is 2601 or 2627;

        return false;
    }

    private async Task UpsertProductsBatchOnlyAsync(string provider, List<WooProductDto> products, CancellationToken ct)
    {
        foreach (var p in products)
        {
            if (p.id <= 0) continue;
            if (string.IsNullOrWhiteSpace(p.slug)) continue;

            // ✅ map: woo product id -> internal product id
            var productId = await _map.GetOrCreateInternalIdAsync(
                provider, "Product", externalId: p.id.ToString(), slug: p.slug.Trim(), ct);

            var product = await _db.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == productId, ct);

            if (product == null)
            {
                product = new Product { Id = productId };
                _db.Products.Add(product);
            }

            // --- core fields
            product.Title = (p.name ?? p.slug!).Trim();
            product.Slug = p.slug!.Trim();
            product.Sku = string.IsNullOrWhiteSpace(p.sku) ? null : p.sku.Trim();
            product.DescriptionHtml = p.description ?? product.DescriptionHtml ?? "";
            product.Status = ProductStatus.Published;
            product.Visibility = ProductVisibility.PublicCatalog;

            // ✅ اگر variable است، parent را variant product کن
            if (string.Equals(p.type, "variable", StringComparison.OrdinalIgnoreCase))
                product.IsVariantProduct = true;

            // --- categories sync
            if (p.categories != null)
            {
                await _db.ProductCategoryAssignments
                    .Where(x => x.ProductId == product.Id)
                    .ExecuteDeleteAsync(ct);

                var idx = 0;
                foreach (var c in p.categories)
                {
                    if (c == null || c.id <= 0) continue;

                    var catMap = await _map.FindAsync(provider, "CatalogCategory", c.id.ToString(), ct);
                    if (catMap == null) continue;

                    _db.ProductCategoryAssignments.Add(new ProductCategoryAssignment
                    {
                        ProductId = product.Id,
                        CatalogCategoryId = catMap.InternalId,
                        IsPrimary = idx == 0,
                        SortOrder = idx++
                    });
                }
            }

            // --- tags sync
            if (p.tags != null)
            {
                await _db.ProductTags
                    .Where(x => x.ProductId == product.Id)
                    .ExecuteDeleteAsync(ct);

                foreach (var t in p.tags)
                {
                    if (t == null || t.id <= 0) continue;

                    var tagMap = await _map.FindAsync(provider, "Tag", t.id.ToString(), ct);
                    if (tagMap == null) continue;

                    _db.ProductTags.Add(new ProductTag
                    {
                        ProductId = product.Id,
                        TagId = tagMap.InternalId
                    });
                }
            }
        }
    }


    private static decimal? ParseWooPrice(string? price, string? regular, string? sale)
    {
        static decimal? Try(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null;
            s = s.Trim().Replace(",", "").Replace(" ", "");
            if (decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d)) return d;
            return null;
        }

        // Woo sometimes sends "" for nulls
        var saleD = Try(sale);
        var regD = Try(regular);
        var priceD = Try(price);

        // اولویت منطقی
        return regD ?? priceD ?? saleD;
    }

}

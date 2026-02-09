using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Entities;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Woo;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Importers.WordPress.Core.Imports;

/// <summary>
/// انتقال دسته‌بندی‌های محصولات (CatalogCategory) و برچسب‌های محصولات (Tag)
/// + استخراج سئو از RankMath برای هر دسته/برچسب.
/// </summary>
public sealed class ProductCatalogImport
{
    private readonly WooClient _woo;
    private readonly ShopDbContext _db;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;
    private readonly RankMathClient _rankMath;

    public ProductCatalogImport(
        WooClient woo,
        ShopDbContext db,
        WordPressImportOptions opt,
        ExternalMapService map,
        RankMathClient rankMath)
    {
        _woo = woo;
        _db = db;
        _opt = opt;
        _map = map;
        _rankMath = rankMath;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var provider = _opt.Provider;
        var apiPrefix = _opt.Woo.ApiPrefix.TrimEnd('/');

        var categories = await _woo.GetPagedAsync<WooCategoryDto>($"{apiPrefix}/products/categories", perPage: 100, ct: ct);
        var tags = await _woo.GetPagedAsync<WooTagDto>($"{apiPrefix}/products/tags", perPage: 100, ct: ct);

        // 1) Upsert categories (بدون parent ابتدا)
        foreach (var c in categories)
        {
            if (string.IsNullOrWhiteSpace(c.slug) || string.IsNullOrWhiteSpace(c.name))
                continue;

            var id = await _map.GetOrCreateInternalIdAsync(provider, "CatalogCategory", c.id.ToString(), c.slug, ct);
            var entity = await _db.CatalogCategories.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null)
            {
                entity = new CatalogCategory { Id = id };
                _db.CatalogCategories.Add(entity);
            }

            entity.Title = c.name!.Trim();
            entity.Slug = c.slug!.Trim();
            entity.IsActive = true;
        }
        await _db.SaveChangesAsync(ct);

        // 2) Set parent relationships (بعد از اینکه همه internalId ها ساخته شدن)
        foreach (var c in categories)
        {
            if (string.IsNullOrWhiteSpace(c.slug) || string.IsNullOrWhiteSpace(c.name))
                continue;

            var map = await _map.FindAsync(provider, "CatalogCategory", c.id.ToString(), ct);
            if (map == null) continue;

            var entity = await _db.CatalogCategories.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == map.InternalId, ct);
            if (entity == null) continue;

            if (c.parent > 0)
            {
                var parentMap = await _map.FindAsync(provider, "CatalogCategory", c.parent.ToString(), ct);
                entity.ParentId = parentMap?.InternalId;
            }
            else
            {
                entity.ParentId = null;
            }
        }
        await _db.SaveChangesAsync(ct);

        // 3) Upsert tags
        foreach (var t in tags)
        {
            if (string.IsNullOrWhiteSpace(t.slug) || string.IsNullOrWhiteSpace(t.name))
                continue;

            var id = await _map.GetOrCreateInternalIdAsync(provider, "Tag", t.id.ToString(), t.slug, ct);
            var entity = await _db.Tags.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity == null)
            {
                entity = new Tag { Id = id };
                _db.Tags.Add(entity);
            }

            entity.Name = t.name!.Trim();
            entity.Slug = t.slug!.Trim();
        }
        await _db.SaveChangesAsync(ct);

        // 4) SEO (RankMath) برای دسته‌ها و برچسب‌ها
        await ApplyCatalogSeoAsync(categories, tags, ct);

        await _db.SaveChangesAsync(ct);
    }

    private async Task ApplyCatalogSeoAsync(List<WooCategoryDto> categories, List<WooTagDto> tags, CancellationToken ct)
    {
        var baseUrl = _opt.BaseUrl.TrimEnd('/');

        static string? TrimTo(string? s, int max)
        {
            if (string.IsNullOrWhiteSpace(s)) return s;
            s = s.Trim();
            return s.Length <= max ? s : s[..max];
        }

        // Category SEO
        foreach (var c in categories)
        {
            if (string.IsNullOrWhiteSpace(c.slug)) continue;
            var map = await _map.FindAsync(_opt.Provider, "CatalogCategory", c.id.ToString(), ct);
            if (map == null) continue;

            var entity = await _db.CatalogCategories.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == map.InternalId, ct);
            if (entity == null) continue;

            var urlCandidates = new[]
            {
            $"{baseUrl}/product-category/{c.slug}/",
            $"{baseUrl}/product-category/{c.slug}",
        };

            var seo = await SeoImportUtil.TryGetRankMathSeoAsync(_rankMath, baseUrl, urlCandidates, ct);
            if (seo == null) continue;

            entity.Seo.MetaTitle = TrimTo(seo.Value.metaTitle, 512) ?? "";
            entity.Seo.MetaDescription = TrimTo(seo.Value.metaDesc, 2000) ?? "";
            entity.Seo.SeoSchemaJson = seo.Value.schemaJson;
        }

        // Tag SEO
        foreach (var t in tags)
        {
            if (string.IsNullOrWhiteSpace(t.slug)) continue;
            var map = await _map.FindAsync(_opt.Provider, "Tag", t.id.ToString(), ct);
            if (map == null) continue;

            var entity = await _db.Tags.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == map.InternalId, ct);
            if (entity == null) continue;

            var urlCandidates = new[]
            {
            $"{baseUrl}/product-tag/{t.slug}/",
            $"{baseUrl}/product-tag/{t.slug}",
        };

            var seo = await SeoImportUtil.TryGetRankMathSeoAsync(_rankMath, baseUrl, urlCandidates, ct);
            if (seo == null) continue;

            entity.Seo.MetaTitle = TrimTo(seo.Value.metaTitle, 160) ?? "";
            entity.Seo.MetaDescription = TrimTo(seo.Value.metaDesc, 320) ?? "";
            entity.Seo.SeoSchemaJson = seo.Value.schemaJson;
        }
    }
}

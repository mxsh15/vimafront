using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Wp;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;
using System.Runtime.Intrinsics.Arm;
using System.Text.Json;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class ProductVendorLinkImport
{
    private readonly ShopDbContext _db;
    private readonly WpClient _wp;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;
    private readonly ILogger<ProductVendorLinkImport> _log;

    public ProductVendorLinkImport(ShopDbContext db, WpClient wp, WordPressImportOptions opt, ExternalMapService map, ILogger<ProductVendorLinkImport> log)
    {
        _db = db;
        _wp = wp;
        _opt = opt;
        _map = map;
        _log = log;
    }

    private sealed record DokanProductRef(int ProductId, int VendorUserId);
    public sealed record DokanStore(int id, string? store_name);
    public sealed record DokanProduct(int id, string? name, string? status, string? type, string? sku);
    private sealed record DokanProductLinkRow(int ProductId, int VendorUserId);

    public async Task<Dictionary<int, List<DokanProduct>>> GetProductsByStoreAsync(CancellationToken ct)
    {
        var stores = await GetAllStoresAsync(ct);

        var result = new Dictionary<int, List<DokanProduct>>();

        foreach (var s in stores)
        {
            var products = await GetAllStoreProductsAsync(s.id, ct);
            result[s.id] = products;
            _log.LogInformation("Store {StoreId} ({StoreName}) products={Count}",
                s.id, s.store_name, products.Count);
        }

        return result;
    }

    private async Task<List<DokanStore>> GetAllStoresAsync(CancellationToken ct)
    {
        var all = new List<DokanStore>();
        for (int page = 1; ; page++)
        {
            var raw = await _wp.GetRawAsync(
                "/wp-json/dokan/v1/stores",
                new() { ["per_page"] = "100", ["page"] = page.ToString() },
                ct
            );

            var chunk = JsonSerializer.Deserialize<List<DokanStore>>(raw,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

            if (chunk.Count == 0) break;

            all.AddRange(chunk);
        }

        return all;
    }

    private async Task<List<DokanProduct>> GetAllStoreProductsAsync(int storeId, CancellationToken ct)
    {
        var all = new List<DokanProduct>();

        for (int page = 1; ; page++)
        {
            var raw = await _wp.GetRawAsync(
                $"/wp-json/dokan/v1/stores/{storeId}/products",
                new() { ["per_page"] = "100", ["page"] = page.ToString() },
                ct
            );

            var chunk = JsonSerializer.Deserialize<List<DokanProduct>>(raw,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

            if (chunk.Count == 0) break;

            all.AddRange(chunk);
        }

        return all;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var provider = _opt.Provider;

        // 1) فروشنده‌ها + محصولات هر فروشنده (منبع حقیقت)
        var stores = await GetAllStoresAsync(ct);

        var updatedOwners = 0;
        var movedOffers = 0;
        var createdOffers = 0; // فعلا استفاده نمی‌کنی، ولی نگه داشتی
        var skippedNoMap = 0;
        var skippedNoVendor = 0;

        foreach (var store in stores)
        {
            ct.ThrowIfCancellationRequested();

            // Dokan store.id عملا همون VendorUserId تو خیلی از نصب‌هاست
            var vendorUserId = store.id;
            if (vendorUserId <= 0) continue;

            // VendorId داخلی شما از روی wp user id
            var vendorId = await ResolveVendorIdByWpUserIdAsync(vendorUserId, ct);
            if (!vendorId.HasValue)
            {
                skippedNoVendor++;
                continue;
            }

            // 2) محصولات همین فروشنده
            var storeProducts = await GetAllStoreProductsAsync(store.id, ct);
            _log.LogInformation("[ProductVendorLink] storeId={StoreId} products={Count}", store.id, storeProducts.Count);

            foreach (var p in storeProducts)
            {
                ct.ThrowIfCancellationRequested();

                if (p.id <= 0) continue;

                // 3) map کردن محصول WP -> محصول داخلی
                var map = await _map.FindAsync(provider, "Product", p.id.ToString(), ct);
                if (map == null)
                {
                    skippedNoMap++;
                    continue;
                }

                var productId = map.InternalId;

                // 4) OwnerVendorId
                var changed = await _db.Products
                    .Where(x => x.Id == productId && x.OwnerVendorId != vendorId.Value)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.OwnerVendorId, vendorId.Value), ct);

                if (changed > 0) updatedOwners++;

                // 5) VendorOffer: فقط move کن، offer صفر نساز (طبق سیاست خودت)
                var offers = await _db.VendorOffers.IgnoreQueryFilters()
                    .Where(o => o.ProductId == productId && !o.IsDeleted)
                    .ToListAsync(ct);

                var target = offers.FirstOrDefault(o => o.VendorId == vendorId.Value);

                if (target == null)
                {
                    if (offers.Count == 1)
                    {
                        offers[0].VendorId = vendorId.Value;
                        offers[0].IsDefaultForProduct = true;
                        offers[0].Status = VendorOfferStatus.Approved;
                        offers[0].UpdatedAtUtc = DateTime.UtcNow;
                        movedOffers++;

                        await _db.VendorOffers
                            .Where(x => x.ProductId == productId && x.VendorId != vendorId.Value && !x.IsDeleted)
                            .ExecuteUpdateAsync(s => s.SetProperty(x => x.IsDefaultForProduct, false), ct);
                    }
                    else
                    {
                        _log.LogWarning(
                            "[ProductVendorLink] SKIP offer move: productId={ProductId} offers={Count} storeId={StoreId}",
                            productId, offers.Count, store.id);
                    }
                }
            }
        }

        await _db.SaveChangesAsync(ct);

        _log.LogInformation(
            "[ProductVendorLink] updatedOwners={U} movedOffers={M} createdOffers={C} skippedNoMap={SNM} skippedNoVendor={SNV}",
            updatedOwners, movedOffers, createdOffers, skippedNoMap, skippedNoVendor);
    }

    private async Task<Guid?> ResolveVendorIdByWpUserIdAsync(int wpUserId, CancellationToken ct)
    {
        var email = $"vendor{wpUserId}@import.nobelfarm.local";

        var userId = await _db.Users.IgnoreQueryFilters()
            .Where(u => !u.IsDeleted && u.Email == email)
            .Select(u => u.Id)
            .FirstOrDefaultAsync(ct);

        if (userId == Guid.Empty) return null;

        var vendorId = await _db.VendorMembers.IgnoreQueryFilters()
            .Where(vm => !vm.IsDeleted && vm.IsActive && vm.UserId == userId)
            .Select(vm => vm.VendorId)
            .FirstOrDefaultAsync(ct);

        return vendorId == Guid.Empty ? null : vendorId;
    }
}

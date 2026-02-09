using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Settings;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public SettingsController(ShopDbContext db) => _db = db;

    // GET: /api/settings
    [HttpGet]
    [RequirePermission("settings.view")]
    public async Task<ActionResult<StoreSettingsDto>> Get()
    {
        var s = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (s == null)
        {
            // اگر وجود نداشت، یکی بساز (singleton)
            s = new StoreSettings();
            _db.StoreSettings.Add(s);
            await _db.SaveChangesAsync();
        }

        return Ok(ToDto(s));
    }

    // PUT: /api/settings
    [HttpPut]
    [RequirePermission("settings.update")]
    public Task<IActionResult> Update([FromBody] StoreSettingsUpdateDto dto)
    {
        return ConcurrencyExtensions.HandleConcurrencyAsync(async () =>
        {
            var s = await _db.StoreSettings
                .OrderByDescending(x => x.CreatedAtUtc)
                .FirstOrDefaultAsync();

            if (s == null)
            {
                s = new StoreSettings();
                _db.StoreSettings.Add(s);
                await _db.SaveChangesAsync();
            }

            var wasMultiVendorEnabled = s.MultiVendorEnabled;

            // Concurrency (RowVersion base64)
            if (!string.IsNullOrWhiteSpace(dto.RowVersion))
            {
                var original = Convert.FromBase64String(dto.RowVersion);
                _db.Entry(s).Property(x => x.RowVersion).OriginalValue = original;
            }

            s.StoreName = dto.StoreName?.Trim() ?? "ShopVima";
            s.LogoUrl = dto.LogoUrl;
            s.SupportEmail = dto.SupportEmail;
            s.SupportPhone = dto.SupportPhone;

            s.InstagramUrl = dto.InstagramUrl;
            s.TelegramUrl = dto.TelegramUrl;
            s.WhatsappUrl = dto.WhatsappUrl;
            s.YoutubeUrl = dto.YoutubeUrl;
            s.LinkedinUrl = dto.LinkedinUrl;

            s.DefaultMetaTitle = dto.DefaultMetaTitle;
            s.DefaultMetaDescription = dto.DefaultMetaDescription;
            s.CanonicalBaseUrl = dto.CanonicalBaseUrl;
            s.RobotsTxt = dto.RobotsTxt;
            s.SitemapEnabled = dto.SitemapEnabled;

            // === فلگ چندفروشندگی ===
            s.MultiVendorEnabled = dto.MultiVendorEnabled;

            s.TimeZoneId = string.IsNullOrWhiteSpace(dto.TimeZoneId) ? "Asia/Tehran" : dto.TimeZoneId.Trim();
            s.DateFormat = string.IsNullOrWhiteSpace(dto.DateFormat) ? "yyyy/MM/dd" : dto.DateFormat.Trim();

            if (wasMultiVendorEnabled && !s.MultiVendorEnabled)
            {
                await NormalizeToSingleVendorAsync(s);
            }

            s.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(s));
        });
    }

    private static StoreSettingsDto ToDto(StoreSettings s) =>
        new(
            s.Id,
            s.CreatedAtUtc,
            s.UpdatedAtUtc,
            s.IsDeleted,
            Convert.ToBase64String(s.RowVersion),

            s.StoreName,
            s.LogoUrl,
            s.SupportEmail,
            s.SupportPhone,

            s.InstagramUrl,
            s.TelegramUrl,
            s.WhatsappUrl,
            s.YoutubeUrl,
            s.LinkedinUrl,

            s.DefaultMetaTitle,
            s.DefaultMetaDescription,
            s.CanonicalBaseUrl,
            s.RobotsTxt,
            s.SitemapEnabled,

            s.TimeZoneId,
            s.DateFormat,

            s.MultiVendorEnabled,
            s.StoreVendorId
        );

    private async Task NormalizeToSingleVendorAsync(StoreSettings s)
    {
        // 1) Vendor اصلی فروشگاه را بساز/بگیر
        if (!s.StoreVendorId.HasValue || s.StoreVendorId.Value == Guid.Empty)
        {
            var v = new Vendor
            {
                StoreName = string.IsNullOrWhiteSpace(s.StoreName) ? "ShopVima" : s.StoreName.Trim(),
                Status = true
            };

            _db.Vendors.Add(v);
            await _db.SaveChangesAsync(); // تا Id داشته باشیم

            s.StoreVendorId = v.Id;
            await _db.SaveChangesAsync();
        }

        var storeVendorId = s.StoreVendorId!.Value;

        // 2) تمام محصولات OwnerVendorId را روی Vendor فروشگاه بگذار
        await _db.Products
            .Where(p => !p.IsDeleted)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(p => p.OwnerVendorId, storeVendorId)
                       .SetProperty(p => p.UpdatedAtUtc, DateTime.UtcNow));

        // 3) Offerهای پیش‌فرض را به Vendor فروشگاه منتقل کن
        await _db.VendorOffers
            .Where(o => !o.IsDeleted && o.IsDefaultForProduct)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(o => o.VendorId, storeVendorId)
                       .SetProperty(o => o.UpdatedAtUtc, DateTime.UtcNow));

        // 4) Offerهای غیرپیش‌فرض را soft-delete کن (چون تک‌فروشنده‌ایم)
        await _db.VendorOffers
            .Where(o => !o.IsDeleted && !o.IsDefaultForProduct)
            .ExecuteUpdateAsync(setters =>
                setters.SetProperty(o => o.IsDeleted, true)
                       .SetProperty(o => o.DeletedAtUtc, DateTime.UtcNow)
                       .SetProperty(o => o.UpdatedAtUtc, DateTime.UtcNow));
    }

}

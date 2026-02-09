using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Settings;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/public/settings")]
[AllowAnonymous]
public class PublicSettingsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicSettingsController(ShopDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PublicStoreSettingsDto>> Get()
    {
        var s = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (s == null)
        {
            return Ok(new PublicStoreSettingsDto(
                StoreName: "VimaShop",
                LogoUrl: null,
                SupportEmail: null,
                SupportPhone: null,
                InstagramUrl: null,
                TelegramUrl: null,
                WhatsappUrl: null,
                DefaultMetaTitle: "VimaShop",
                DefaultMetaDescription: null,
                CanonicalBaseUrl: null,
                DateFormat: "yyyy/MM/dd",
                TimeZoneId: "Asia/Tehran",
                MultiVendorEnabled: true,
                StoreVendorId: null
            ));
        }

        return Ok(new PublicStoreSettingsDto(
            s.StoreName,
            s.LogoUrl,
            s.SupportEmail,
            s.SupportPhone,
            s.InstagramUrl,
            s.TelegramUrl,
            s.WhatsappUrl,
            s.DefaultMetaTitle,
            s.DefaultMetaDescription,
            s.CanonicalBaseUrl,
            s.DateFormat,
            s.TimeZoneId,
            s.MultiVendorEnabled,
            s.StoreVendorId
        ));
    }
}

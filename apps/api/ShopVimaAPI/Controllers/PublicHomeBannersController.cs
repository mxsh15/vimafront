using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.HomeBanner;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/public/home-banners")]
public sealed class PublicHomeBannersController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicHomeBannersController(ShopDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicHomeBannerDto>>> List()
    {
        var now = DateTimeOffset.UtcNow;

        var list = await _db.HomeBanner.AsNoTracking()
            .Where(x => !x.IsDeleted && x.IsActive)
            .Where(x => (x.StartAt == null || x.StartAt <= now) && (x.EndAt == null || x.EndAt >= now))
            .Include(x => x.MediaAsset)
            .OrderBy(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(x => new PublicHomeBannerDto(
                x.MediaAssetId,
                x.MediaAsset.Url,
                x.LinkUrl,
                x.Title,
                x.AltText
            ))
            .ToListAsync();

        return Ok(list);
    }
}

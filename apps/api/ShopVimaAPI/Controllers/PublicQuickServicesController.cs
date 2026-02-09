using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.QuickService;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/public/quick-services")]
public sealed class PublicQuickServicesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicQuickServicesController(ShopDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicQuickServiceDto>>> List()
    {
        var list = await _db.QuickServices.AsNoTracking()
            .Where(x => !x.IsDeleted && x.IsActive)
            .Include(x => x.MediaAsset)
            .OrderBy(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(x => new PublicQuickServiceDto(
                x.MediaAssetId,
                x.MediaAsset.Url,
                x.Title,
                x.LinkUrl
            ))
            .ToListAsync();

        return Ok(list);
    }
}

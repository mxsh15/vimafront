using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.HomeTemplate;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/public/home-layout")]
public sealed class PublicHomeLayoutController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicHomeLayoutController(ShopDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PublicHomeLayoutDto>> Get()
    {
        var store = await _db.StoreSettings.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (store?.ActiveHomeTemplateId is null)
            return Ok(new PublicHomeLayoutDto(null, null, new()));

        var t = await _db.HomeTemplates.AsNoTracking()
            .Where(x => !x.IsDeleted && x.IsEnabled && x.Id == store.ActiveHomeTemplateId.Value)
            .Include(x => x.Sections.Where(s => !s.IsDeleted && s.IsEnabled))
            .FirstOrDefaultAsync();

        if (t is null)
            return Ok(new PublicHomeLayoutDto(null, null, new()));

        var sections = t.Sections
            .OrderBy(s => s.SortOrder)
            .Select(s => new PublicHomeSectionDto(s.Type, s.ConfigJson))
            .ToList();

        return Ok(new PublicHomeLayoutDto(t.Id, t.Slug, sections));
    }
}

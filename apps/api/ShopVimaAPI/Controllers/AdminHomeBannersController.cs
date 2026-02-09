using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using ShopVima.Application.Dtos.HomeBanner;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/home-banners")]
[Authorize]
public sealed class AdminHomeBannersController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminHomeBannersController(ShopDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string status = "all")
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.HomeBanner.AsNoTracking()
            .Where(x => !x.IsDeleted)
            .Include(x => x.MediaAsset);

        if (!string.IsNullOrWhiteSpace(q))
        {
            q = q.Trim();
            query = (IIncludableQueryable<HomeBanner, MediaAsset>)query.Where(x =>
                (x.Title != null && x.Title.Contains(q)) ||
                (x.AltText != null && x.AltText.Contains(q)) ||
                (x.LinkUrl != null && x.LinkUrl.Contains(q)));
        }

        status = (status ?? "all").Trim().ToLowerInvariant();

        if (status == "active") 
            query = (IIncludableQueryable<HomeBanner, MediaAsset>)query.Where(x => x.IsActive);

        if (status == "inactive") 
            query = (IIncludableQueryable<HomeBanner, MediaAsset>)query.Where(x => !x.IsActive);

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminHomeBannerListItemDto(
                x.Id,
                x.MediaAssetId,
                x.MediaAsset.Url,
                x.LinkUrl,
                x.Title,
                x.AltText,
                x.SortOrder,
                x.IsActive,
                x.StartAt,
                x.EndAt
            ))
            .ToListAsync();

        return Ok(new { page, pageSize, total, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminHomeBannerListItemDto>> Get(Guid id)
    {
        var x = await _db.HomeBanner.AsNoTracking()
            .Where(b => !b.IsDeleted && b.Id == id)
            .Include(b => b.MediaAsset)
            .Select(b => new AdminHomeBannerListItemDto(
                b.Id,
                b.MediaAssetId,
                b.MediaAsset.Url,
                b.LinkUrl,
                b.Title,
                b.AltText,
                b.SortOrder,
                b.IsActive,
                b.StartAt,
                b.EndAt
            ))
            .FirstOrDefaultAsync();

        if (x is null) return NotFound();
        return Ok(x);
    }

    [HttpPost]
    public async Task<ActionResult<AdminHomeBannerListItemDto>> Create([FromBody] AdminHomeBannerUpsertDto dto)
    {
        if (dto.StartAt.HasValue && dto.EndAt.HasValue && dto.EndAt <= dto.StartAt)
            return BadRequest(new { problem = "EndAt must be after StartAt" });

        // validate MediaAsset exists
        var asset = await _db.MediaAssets.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == dto.MediaAssetId && !a.IsDeleted);
        if (asset is null) return BadRequest(new { problem = "Invalid MediaAssetId" });

        var entity = new HomeBanner
        {
            MediaAssetId = dto.MediaAssetId,
            LinkUrl = string.IsNullOrWhiteSpace(dto.LinkUrl) ? null : dto.LinkUrl.Trim(),
            Title = string.IsNullOrWhiteSpace(dto.Title) ? null : dto.Title.Trim(),
            AltText = string.IsNullOrWhiteSpace(dto.AltText) ? null : dto.AltText.Trim(),
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            StartAt = dto.StartAt,
            EndAt = dto.EndAt
        };

        _db.HomeBanner.Add(entity);
        await _db.SaveChangesAsync();

        // دوباره با Include برای خروجی کامل
        var created = await _db.HomeBanner.AsNoTracking()
            .Where(x => x.Id == entity.Id)
            .Include(x => x.MediaAsset)
            .Select(x => new AdminHomeBannerListItemDto(
                x.Id, x.MediaAssetId, x.MediaAsset.Url, // <-- اصلاح
                x.LinkUrl, x.Title, x.AltText,
                x.SortOrder, x.IsActive, x.StartAt, x.EndAt
            ))
            .FirstAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] AdminHomeBannerUpsertDto dto)
    {
        if (dto.StartAt.HasValue && dto.EndAt.HasValue && dto.EndAt <= dto.StartAt)
            return BadRequest(new { problem = "EndAt must be after StartAt" });

        var entity = await _db.HomeBanner
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();

        // validate MediaAsset exists
        var assetExists = await _db.MediaAssets.AsNoTracking()
            .AnyAsync(a => a.Id == dto.MediaAssetId && !a.IsDeleted);
        if (!assetExists) return BadRequest(new { problem = "Invalid MediaAssetId" });

        entity.MediaAssetId = dto.MediaAssetId;
        entity.LinkUrl = string.IsNullOrWhiteSpace(dto.LinkUrl) ? null : dto.LinkUrl.Trim();
        entity.Title = string.IsNullOrWhiteSpace(dto.Title) ? null : dto.Title.Trim();
        entity.AltText = string.IsNullOrWhiteSpace(dto.AltText) ? null : dto.AltText.Trim();
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.StartAt = dto.StartAt;
        entity.EndAt = dto.EndAt;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _db.HomeBanner.FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();

        entity.IsDeleted = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

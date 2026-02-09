using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using ShopVima.Application.Dtos.QuickService;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/quick-services")]
[Authorize]
public sealed class AdminQuickServicesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminQuickServicesController(ShopDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string status = "all")
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.QuickServices.AsNoTracking()
            .Where(x => !x.IsDeleted)
            .Include(x => x.MediaAsset);

        if (!string.IsNullOrWhiteSpace(q))
        {
            q = q.Trim();
            query = (IIncludableQueryable<QuickService, MediaAsset>)query.Where(x =>
                x.Title.Contains(q) || (x.LinkUrl != null && x.LinkUrl.Contains(q)));
        }

        status = (status ?? "all").Trim().ToLowerInvariant();
        if (status == "active")
            query = (IIncludableQueryable<QuickService, MediaAsset>)query.Where(x => x.IsActive);
        if (status == "inactive")
            query = (IIncludableQueryable<QuickService, MediaAsset>)query.Where(x => !x.IsActive);

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminQuickServiceListItemDto(
                x.Id,
                x.MediaAssetId,
                x.MediaAsset.Url,
                x.Title,
                x.LinkUrl,
                x.SortOrder,
                x.IsActive
            ))
            .ToListAsync();

        return Ok(new { page, pageSize, total, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminQuickServiceListItemDto>> Get(Guid id)
    {
        var x = await _db.QuickServices.AsNoTracking()
            .Where(b => !b.IsDeleted && b.Id == id)
            .Include(b => b.MediaAsset)
            .Select(b => new AdminQuickServiceListItemDto(
                b.Id,
                b.MediaAssetId,
                b.MediaAsset.Url,
                b.Title,
                b.LinkUrl,
                b.SortOrder,
                b.IsActive
            ))
            .FirstOrDefaultAsync();

        if (x is null) return NotFound();
        return Ok(x);
    }

    [HttpPost]
    public async Task<ActionResult<AdminQuickServiceListItemDto>> Create([FromBody] AdminQuickServiceUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { problem = "Title is required" });

        var assetExists = await _db.MediaAssets.AsNoTracking()
            .AnyAsync(a => a.Id == dto.MediaAssetId && !a.IsDeleted);
        if (!assetExists) return BadRequest(new { problem = "Invalid MediaAssetId" });

        var entity = new QuickService
        {
            MediaAssetId = dto.MediaAssetId,
            Title = dto.Title.Trim(),
            LinkUrl = string.IsNullOrWhiteSpace(dto.LinkUrl) ? null : dto.LinkUrl.Trim(),
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
        };

        _db.QuickServices.Add(entity);
        await _db.SaveChangesAsync();

        var created = await _db.QuickServices.AsNoTracking()
            .Where(x => x.Id == entity.Id)
            .Include(x => x.MediaAsset)
            .Select(x => new AdminQuickServiceListItemDto(
                x.Id, x.MediaAssetId, x.MediaAsset.Url,
                x.Title, x.LinkUrl, x.SortOrder, x.IsActive
            ))
            .FirstAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] AdminQuickServiceUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { problem = "Title is required" });

        var entity = await _db.QuickServices.FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();

        var assetExists = await _db.MediaAssets.AsNoTracking()
            .AnyAsync(a => a.Id == dto.MediaAssetId && !a.IsDeleted);
        if (!assetExists) return BadRequest(new { problem = "Invalid MediaAssetId" });

        entity.MediaAssetId = dto.MediaAssetId;
        entity.Title = dto.Title.Trim();
        entity.LinkUrl = string.IsNullOrWhiteSpace(dto.LinkUrl) ? null : dto.LinkUrl.Trim();
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _db.QuickServices.FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();

        entity.IsDeleted = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

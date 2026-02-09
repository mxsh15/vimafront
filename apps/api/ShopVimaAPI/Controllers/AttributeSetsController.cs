using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.AttributeSet;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/attributeSets")]
public class AttributeSetsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public AttributeSetsController(ShopDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AttributeSetListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.AttributeSets.AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Name.Contains(s) ||
                (x.Description != null && x.Description.Contains(s)));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AttributeSetListItemDto(
                x.Id,
                x.Name,
                x.Description
            ))
            .ToListAsync();

        var result = new PagedResult<AttributeSetListItemDto>(items, total, page, pageSize);
        return Ok(result);
    }



    [HttpGet("options")]
    public async Task<ActionResult<IEnumerable<AttributeSetOptionDto>>> Options([FromQuery] bool onlyActive = true)
    {
        var query = _db.AttributeSets.AsNoTracking();

        if (onlyActive)
            query = query.Where(x => !x.IsDeleted && x.Status);

        var items = await query
            .OrderBy(x => x.Name)
            .Select(s => new AttributeSetOptionDto(
                s.Id,
                s.Name
            ))
            .ToListAsync();

        return Ok(items);
    }



    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AttributeSetDto>> Get(Guid id)
    {
        var entity = await _db.AttributeSets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null) return NotFound();

        var dto = new AttributeSetDto(
            entity.Id,
            entity.Name,
            entity.Description,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.IsDeleted,
            Convert.ToBase64String(entity.RowVersion)
        );

        return Ok(dto);
    }



    [HttpPost]
    public async Task<ActionResult<AttributeSetDto>> Create(AttributeSetUpsertDto input)
    {
        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest("Name is required");

        var entity = new AttributeSet
        {
            Name = input.Name.Trim(),
            Description = input.Description?.Trim()
        };

        _db.AttributeSets.Add(entity);
        await _db.SaveChangesAsync();

        var dto = new AttributeSetDto(
            entity.Id,
            entity.Name,
            entity.Description,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.IsDeleted,
            Convert.ToBase64String(entity.RowVersion)
        );

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }



    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AttributeSetDto>> Update(Guid id, AttributeSetUpsertDto input)
    {
        var entity = await _db.AttributeSets.FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        if (!string.IsNullOrEmpty(input.RowVersion))
        {
            var clientRowVersion = Convert.FromBase64String(input.RowVersion);
            if (!entity.RowVersion.SequenceEqual(clientRowVersion))
                return Conflict("مقدار همزمانی (RowVersion) با دیتابیس متفاوت است.");
        }

        entity.Name = input.Name.Trim();
        entity.Description = input.Description?.Trim();
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new AttributeSetDto(
            entity.Id,
            entity.Name,
            entity.Description,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.IsDeleted,
            Convert.ToBase64String(entity.RowVersion)
        );

        return Ok(dto);
    }



    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.AttributeSets.FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;
        entity.Status = false;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

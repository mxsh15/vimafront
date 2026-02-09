using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Specs;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/attributeGroups")]
[Authorize]
public class AttributeGroupsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public AttributeGroupsController(ShopDbContext db)
    {
        _db = db;
    }

    // GET api/attributeGroups?page=1&pageSize=20&q=&attributeSetId=
    [HttpGet]
    [RequirePermission("specGroups.view")]
    public async Task<ActionResult<PagedResult<AttributeGroupListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] Guid? attributeSetId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.AttributeGroups
            .AsNoTracking()
            .Include(g => g.AttributeSet)
            .Include(g => g.Attributes)
            .Where(g => !g.IsDeleted);

        if (attributeSetId.HasValue)
        {
            query = query.Where(g => g.AttributeSetId == attributeSetId.Value);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(g =>
                g.Name.Contains(s) ||
                (g.AttributeSet != null && g.AttributeSet.Name.Contains(s)));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(g => g.AttributeSet.Name)
            .ThenBy(g => g.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new AttributeGroupListItemDto(
                g.Id,
                g.AttributeSetId,
                g.AttributeSet.Name,
                g.Name,
                g.SortOrder,
                g.Attributes.Count(a => !a.IsDeleted),
                g.Attributes.Where(a => !a.IsDeleted)
                            .Select(a => a.Id)
                            .ToList()
            ))
            .ToListAsync();

        var result = new PagedResult<AttributeGroupListItemDto>(items, total, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("specGroups.view")]
    public async Task<ActionResult<AttributeGroupDto>> Get(Guid id)
    {
        var g = await _db.AttributeGroups
                .Include(x => x.AttributeSet)
                .Include(x => x.Attributes.Where(a => !a.IsDeleted))
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (g == null) return NotFound();

        var attributeIds = g.Attributes
            .Where(a => !a.IsDeleted)
            .Select(a => a.Id)
            .ToList();

        var dto = new AttributeGroupDto(
            g.Id,
            g.AttributeSetId,
            g.AttributeSet.Name,
            g.Name,
            g.SortOrder,
            g.CreatedAtUtc,
            g.UpdatedAtUtc,
            g.IsDeleted,
            Convert.ToBase64String(g.RowVersion),
            attributeIds
        );

        return Ok(dto);
    }

    [HttpPost]
    [RequirePermission("specGroups.create")]
    public async Task<ActionResult<AttributeGroupDto>> Create(AttributeGroupUpsertDto input)
    {
        var set = await _db.AttributeSets
            .FirstOrDefaultAsync(x => x.Id == input.AttributeSetId && !x.IsDeleted);

        if (set == null)
            return BadRequest("AttributeSet not found");

        var entity = new AttributeGroup
        {
            AttributeSetId = input.AttributeSetId,
            Name = input.Name.Trim(),
            SortOrder = input.SortOrder
        };

        _db.AttributeGroups.Add(entity);
        await _db.SaveChangesAsync();

        if (input.AttributeIds.Any())
        {
            var attrs = await _db.ProductAttributes
                .Where(a => input.AttributeIds.Contains(a.Id) && !a.IsDeleted)
                .ToListAsync();

            foreach (var a in attrs)
                a.AttributeGroupId = entity.Id;

            await _db.SaveChangesAsync();
        }

        var dto = new AttributeGroupDto(
            entity.Id,
            entity.AttributeSetId,
            set.Name,
            entity.Name,
            entity.SortOrder,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.IsDeleted,
            Convert.ToBase64String(entity.RowVersion),
            input.AttributeIds
        );

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }


    [HttpPut("{id:guid}")]
    [RequirePermission("specGroups.update")]
    public async Task<ActionResult<AttributeGroupDto>> Update(Guid id, AttributeGroupUpsertDto input)
    {
        var g = await _db.AttributeGroups.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return NotFound();

        if (!string.IsNullOrEmpty(input.RowVersion))
        {
            var clientRowVersion = Convert.FromBase64String(input.RowVersion);
            if (!g.RowVersion.SequenceEqual(clientRowVersion))
                return Conflict("مقدار همزمانی (RowVersion) با دیتابیس متفاوت است.");
        }

        g.AttributeSetId = input.AttributeSetId;
        g.Name = input.Name.Trim();
        g.SortOrder = input.SortOrder;
        g.UpdatedAtUtc = DateTime.UtcNow;

        // مدیریت عضویت ویژگی‌ها در این گروه
        var newIds = input.AttributeIds.Distinct().ToHashSet();

        var currentAttrs = await _db.ProductAttributes
            .Where(a => a.AttributeGroupId == g.Id && !a.IsDeleted)
            .ToListAsync();

        // حذف ویژگی‌هایی که دیگر در گروه نیستند
        foreach (var attr in currentAttrs)
        {
            if (!newIds.Contains(attr.Id))
                attr.AttributeGroupId = null;
        }

        // اضافه کردن ویژگی‌های جدید
        var attrsToAdd = await _db.ProductAttributes
            .Where(a => newIds.Contains(a.Id) && a.AttributeGroupId != g.Id && !a.IsDeleted)
            .ToListAsync();

        foreach (var attr in attrsToAdd)
            attr.AttributeGroupId = g.Id;

        await _db.SaveChangesAsync();

        var setName = await _db.AttributeSets
            .Where(x => x.Id == g.AttributeSetId)
            .Select(x => x.Name)
            .FirstOrDefaultAsync() ?? string.Empty;

        var dto = new AttributeGroupDto(
            g.Id,
            g.AttributeSetId,
            setName,
            g.Name,
            g.SortOrder,
            g.CreatedAtUtc,
            g.UpdatedAtUtc,
            g.IsDeleted,
            Convert.ToBase64String(g.RowVersion),
            input.AttributeIds
        );

        return Ok(dto);
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("specGroups.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var g = await _db.AttributeGroups.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return NotFound();

        g.IsDeleted = true;
        g.DeletedAtUtc = DateTime.UtcNow;
        g.Status = false;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
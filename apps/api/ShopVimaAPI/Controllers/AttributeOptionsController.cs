using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.AttributeOption;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/attributeOptions")]
public class AttributeOptionsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public AttributeOptionsController(ShopDbContext db)
    {
        _db = db;
    }


    [HttpGet("by-attribute/{attributeId:guid}")]
    public async Task<ActionResult<List<AttributeOptionDto>>> ListByAttribute(Guid attributeId)
    {
        var items = await _db.AttributeOptions
            .AsNoTracking()
            .Where(x => x.AttributeId == attributeId)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Value)
            .Select(x => new AttributeOptionDto(
                x.Id,
                x.AttributeId,
                x.Value,
                x.DisplayLabel,
                x.SortOrder,
                x.IsDefault
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<AttributeOptionDto>> Create([FromBody] CreateAttributeOptionRequest request)
    {
        if (request.AttributeId == Guid.Empty)
            return BadRequest("AttributeId is required.");

        if (string.IsNullOrWhiteSpace(request.Value))
            return BadRequest("Value is required.");

        var attributeExists = await _db.ProductAttributes
            .AnyAsync(x => x.Id == request.AttributeId && !x.IsDeleted);

        if (!attributeExists)
            return NotFound("Attribute not found.");

        var value = request.Value.Trim();
        var displayLabel = string.IsNullOrWhiteSpace(request.DisplayLabel)
            ? value
            : request.DisplayLabel!.Trim();

        var alreadyExists = await _db.AttributeOptions
            .AnyAsync(o =>
                o.AttributeId == request.AttributeId &&
                (o.DisplayLabel ?? o.Value) == displayLabel
            );

        if (alreadyExists)
            return Conflict("An option with this value already exists.");


        var entity = new AttributeOption
        {
            Id = Guid.NewGuid(),
            AttributeId = request.AttributeId,
            Value = value,
            DisplayLabel = displayLabel,
            SortOrder = request.SortOrder,
            IsDefault = request.IsDefault
        };

        _db.AttributeOptions.Add(entity);
        await _db.SaveChangesAsync();

        var dto = new AttributeOptionDto(
            entity.Id,
            entity.AttributeId,
            entity.Value,
            entity.DisplayLabel,
            entity.SortOrder,
            entity.IsDefault
        );

        return Ok(dto);
    }


    [HttpPost("bulk-upsert")]
    public async Task<ActionResult> BulkUpsert([FromBody] UpsertAttributeOptionsRequest request)
    {
        if (request.AttributeId == Guid.Empty)
            return BadRequest("AttributeId is required.");

        var attributeExists = await _db.ProductAttributes
            .AnyAsync(x => x.Id == request.AttributeId && !x.IsDeleted);

        if (!attributeExists)
            return NotFound("Attribute not found.");

        var existing = await _db.AttributeOptions
            .Where(x => x.AttributeId == request.AttributeId)
            .ToListAsync();

        // حذف گزینه‌هایی که در لیست جدید نیستند
        var keepIds = request.Items.Where(i => i.Id.HasValue).Select(i => i.Id!.Value).ToHashSet();
        var toRemove = existing.Where(x => !keepIds.Contains(x.Id)).ToList();
        if (toRemove.Count > 0)
        {
            _db.AttributeOptions.RemoveRange(toRemove);
        }

        // upsert
        foreach (var item in request.Items)
        {
            if (!item.Id.HasValue || item.Id.Value == Guid.Empty)
            {
                var entity = new AttributeOption
                {
                    Id = Guid.NewGuid(),
                    AttributeId = request.AttributeId,
                    Value = item.Value.Trim(),
                    DisplayLabel = item.DisplayLabel?.Trim(),
                    SortOrder = item.SortOrder,
                    IsDefault = item.IsDefault
                };

                _db.AttributeOptions.Add(entity);
            }
            else
            {
                var id = item.Id.Value;

                var entity = existing.FirstOrDefault(x => x.Id == id);
                if (entity == null)
                    continue;

                entity.Value = item.Value.Trim();
                entity.DisplayLabel = item.DisplayLabel?.Trim();
                entity.SortOrder = item.SortOrder;
                entity.IsDefault = item.IsDefault;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
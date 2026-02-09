using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ProductAttribute;
using ShopVima.Application.Services;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/productAttributes")]
[Authorize]
public class ProductAttributesController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPermissionService _permissionService;

    public ProductAttributesController(ShopDbContext db, IPermissionService permissionService)
    {
        _db = db;
        _permissionService = permissionService;
    }

    [HttpGet]
    [RequirePermission("specAttributes.view")]
    public async Task<ActionResult<PagedResult<ProductAttributeListItemDto>>> List(
        [FromQuery] Guid? attributeGroupId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.ProductAttributes
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (attributeGroupId.HasValue && attributeGroupId.Value != Guid.Empty)
            query = query.Where(x => x.AttributeGroupId == attributeGroupId.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Name.Contains(s) ||
                x.Key.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductAttributeListItemDto(
                x.Id,
                x.AttributeGroupId,
                x.Name,
                x.Key,
                x.Unit,
                x.ValueType,
                x.IsRequired,
                x.IsVariantLevel,
                x.IsFilterable,
                x.IsComparable,
                x.SortOrder
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductAttributeListItemDto>(items, total, page, pageSize));
    }



    [HttpGet("{id:guid}")]
    [RequirePermission("specAttributes.view")]
    public async Task<ActionResult<ProductAttributeDetailDto>> Get(Guid id)
    {
        var entity = await _db.ProductAttributes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (entity == null) return NotFound();

        var dto = new ProductAttributeDetailDto(
            entity.Id,
            entity.AttributeGroupId,
            entity.Name,
            entity.Key,
            entity.Unit,
            entity.ValueType,
            entity.IsRequired,
            entity.IsVariantLevel,
            entity.IsFilterable,
            entity.IsComparable,
            entity.SortOrder,
            entity.RowVersion
        );

        return Ok(dto);
    }


    [HttpPost]
    public async Task<ActionResult> Upsert([FromBody] ProductAttributeUpsertDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);


        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var isUpdate = dto.Id.HasValue && dto.Id.Value != Guid.Empty;
        var requiredPermission = isUpdate ? "specAttributes.update" : "specAttributes.create";
        
        var hasPermission = await _permissionService.HasPermissionAsync(userId, requiredPermission);
        if (!hasPermission)
        {
            return Forbid();
        }

        var normalizedKey = dto.Key.Trim();

        var exists = await _db.ProductAttributes
            .AnyAsync(x =>
                x.Key == normalizedKey &&
                !x.IsDeleted &&
                (dto.Id == null || dto.Id == Guid.Empty || x.Id != dto.Id.Value));

        if (exists)
            return Conflict($"ویژگی دیگری با نامک «{normalizedKey}» قبلاً ثبت شده است.");


        ProductAttribute entity;

        if (dto.Id == null || dto.Id == Guid.Empty)
        {
            // create
            entity = new ProductAttribute
            {
                Id = Guid.NewGuid(),
                AttributeGroupId = dto.AttributeGroupId,
                Name = dto.Name.Trim(),
                Key = dto.Key.Trim(),
                Unit = dto.Unit?.Trim(),
                ValueType = (AttributeValueType)dto.ValueType,
                IsRequired = dto.IsRequired,
                IsVariantLevel = dto.IsVariantLevel,
                IsFilterable = dto.IsFilterable,
                IsComparable = dto.IsComparable,
                SortOrder = dto.SortOrder,
                Status = true,
                IsDeleted = false,
                CreatedAtUtc = DateTime.UtcNow
            };

            _db.ProductAttributes.Add(entity);
        }
        else
        {
            var id = dto.Id!.Value; // Safe because we're in the else block where Id is not null

            entity = await _db.ProductAttributes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null)
                return NotFound();

            if (dto.RowVersion != null &&
                !dto.RowVersion.SequenceEqual(entity.RowVersion))
            {
                return Conflict("اطلاعات توسط کاربر دیگری تغییر کرده است.");
            }

            entity.AttributeGroupId = dto.AttributeGroupId;
            entity.Name = dto.Name.Trim();
            entity.Key = dto.Key.Trim();
            entity.Unit = dto.Unit?.Trim();
            entity.ValueType = (AttributeValueType)dto.ValueType;
            entity.IsRequired = dto.IsRequired;
            entity.IsVariantLevel = dto.IsVariantLevel;
            entity.IsFilterable = dto.IsFilterable;
            entity.IsComparable = dto.IsComparable;
            entity.SortOrder = dto.SortOrder;
            entity.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("unused")]
    [RequirePermission("specAttributes.view")]
    public async Task<ActionResult<PagedResult<ProductAttributeListItemDto>>> Unused(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.ProductAttributes
            .AsNoTracking()
            .Where(a => !a.IsDeleted)
            .Where(a => !_db.ProductAttributeValues.Any(v => v.AttributeId == a.Id && !v.IsDeleted));

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Name.Contains(s) || x.Key.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductAttributeListItemDto(
                x.Id,
                x.AttributeGroupId,
                x.Name,
                x.Key,
                x.Unit,
                x.ValueType,
                x.IsRequired,
                x.IsVariantLevel,
                x.IsFilterable,
                x.IsComparable,
                x.SortOrder
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductAttributeListItemDto>(items, total, page, pageSize));
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("specAttributes.delete")]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var hasPermission = await _permissionService.HasPermissionAsync(userId, "specAttributes.delete");
        if (!hasPermission) return Forbid();

        var entity = await _db.ProductAttributes.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (entity == null) return NotFound();

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("specAttributes.trash.view")]
    public async Task<ActionResult<PagedResult<ProductAttributeListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.ProductAttributes
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Name.Contains(s) || x.Key.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductAttributeListItemDto(
                x.Id,
                x.AttributeGroupId,
                x.Name,
                x.Key,
                x.Unit,
                x.ValueType,
                x.IsRequired,
                x.IsVariantLevel,
                x.IsFilterable,
                x.IsComparable,
                x.SortOrder
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductAttributeListItemDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("specAttributes.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var hasPermission = await _permissionService.HasPermissionAsync(userId, "specAttributes.restore");
        if (!hasPermission) return Forbid();

        var entity = await _db.ProductAttributes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null) return NotFound();
        if (!entity.IsDeleted) return BadRequest("این ویژگی حذف نشده است.");

        entity.IsDeleted = false;
        entity.DeletedAtUtc = null;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("specAttributes.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var hasPermission = await _permissionService.HasPermissionAsync(userId, "specAttributes.hardDelete");
        if (!hasPermission) return Forbid();

        var entity = await _db.ProductAttributes
            .IgnoreQueryFilters()
            .Include(a => a.Options)
            .Include(a => a.Values)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null) return NotFound();

        // حذف وابستگی‌ها
        _db.AttributeOptions.RemoveRange(entity.Options);
        _db.ProductAttributeValues.RemoveRange(entity.Values);

        _db.ProductAttributes.Remove(entity);

        await _db.SaveChangesAsync();
        return NoContent();
    }

}

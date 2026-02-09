using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ProductSpec;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/products/{productId:guid}/specs")]
[Authorize]
public class ProductSpecsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public ProductSpecsController(ShopDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [RequirePermission("products.view")] // یا permission اختصاصی، اگر خواستی
    public async Task<ActionResult<List<ProductSpecItemDto>>> Get(Guid productId)
    {
        // فقط مطمئن شو محصول وجود دارد
        var productExists = await _db.Products
            .AnyAsync(p => p.Id == productId && !p.IsDeleted);

        if (!productExists)
            return NotFound("محصول پیدا نشد.");

        var values = await _db.ProductAttributeValues
            .AsNoTracking()
            .Include(v => v.Attribute)
            .Include(v => v.AttributeGroup)
            .Where(v => v.ProductId == productId && !v.IsDeleted)
            .OrderBy(v => v.AttributeGroupId)
            .ThenBy(v => v.DisplayOrder)
            .ThenBy(v => v.Attribute.SortOrder)
            .ToListAsync();

        var items = values.Select(v => new ProductSpecItemDto(
            v.Id,
            v.AttributeId,
            v.Attribute.Name,
            v.Attribute.Key,
            v.Attribute.ValueType,
            v.AttributeGroupId,
            v.AttributeGroup != null ? v.AttributeGroup.Name : null,
            v.OptionId,
            v.RawValue,
            v.NumericValue,
            v.BoolValue,
            v.DateTimeValue,
            v.DisplayOrder
        )).ToList();

        return Ok(items);
    }

    /// <summary>
    /// Bulk Upsert مشخصات یک محصول
    /// POST /api/products/{productId}/specs
    /// </summary>
    [HttpPost]
    [RequirePermission("products.update")] // یا permission جداگانه اگر دوست داری
    public async Task<IActionResult> Upsert(Guid productId, [FromBody] UpsertProductSpecsRequest request)
    {
        if (request == null)
            return BadRequest("درخواست نامعتبر است.");

        if (request.ProductId != Guid.Empty && request.ProductId != productId)
            return BadRequest("ProductId در آدرس و بدنه درخواست هم‌خوانی ندارد.");

        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == productId && !p.IsDeleted);

        if (product == null)
            return NotFound("محصول پیدا نشد.");

        // همه مقادیر فعلی محصول
        var existing = await _db.ProductAttributeValues
            .Where(v => v.ProductId == productId && !v.IsDeleted)
            .ToListAsync();

        // مجموعه Id هایی که از سمت فرانت آمده‌اند
        var incomingIds = request.Items
            .Where(i => i.Id.HasValue && i.Id.Value != Guid.Empty)
            .Select(i => i.Id!.Value)
            .ToHashSet();

        // ۱) Soft-delete کردن رکوردهایی که دیگر در لیست جدید نیستند
        var toDelete = existing
            .Where(v => !incomingIds.Contains(v.Id))
            .ToList();

        var now = DateTime.UtcNow;
        foreach (var v in toDelete)
        {
            v.IsDeleted = true;
            v.DeletedAtUtc = now;
        }

        // ۲) Upsert رکوردهای جدید / موجود
        foreach (var item in request.Items)
        {
            ProductAttributeValue? entity = null;

            if (item.Id.HasValue && item.Id.Value != Guid.Empty)
            {
                entity = existing.FirstOrDefault(v => v.Id == item.Id.Value);
            }

            if (entity == null)
            {
                // رکورد جدید
                entity = new ProductAttributeValue
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    AttributeId = item.AttributeId,
                    CreatedAtUtc = now
                };
                _db.ProductAttributeValues.Add(entity);
            }

            // مپ کردن مقادیر از DTO به Entity
            entity.AttributeGroupId = item.AttributeGroupId;
            entity.OptionId = item.OptionId;
            entity.RawValue = item.RawValue;
            entity.NumericValue = item.NumericValue;
            entity.BoolValue = item.BoolValue;
            entity.DateTimeValue = item.DateTimeValue;
            entity.DisplayOrder = item.DisplayOrder;

            entity.IsDeleted = false;
            entity.DeletedAtUtc = null;
            entity.UpdatedAtUtc = now;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
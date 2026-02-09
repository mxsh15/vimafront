using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Category;
using ShopVima.Application.Utils;
using ShopVima.Domain.Common;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/productCategories")]
[Authorize]
public class ProductCategoriesController : ControllerBase
{
    private readonly ShopDbContext _db;

    public ProductCategoriesController(ShopDbContext db)
    {
        _db = db;
    }


    [HttpGet]
    [RequirePermission("categories.view")]
    public async Task<ActionResult<PagedResult<CategoryListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.CatalogCategories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(s) ||
                x.Slug.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CategoryListItemDto(
                c.Id,
                c.Title,
                c.Slug,
                c.ParentId,
                c.SortOrder,
                c.IsActive,
                c.ContentHtml,
                c.IconUrl,
                c.Seo.MetaTitle,
                c.Seo.MetaDescription,
                c.Seo.Keywords
            ))
            .ToListAsync();

        var result = new PagedResult<CategoryListItemDto>(items, total, page, pageSize);

        return Ok(result);
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("categories.view")]
    public async Task<ActionResult<CategoryDetailDto>> Get(Guid id)
    {
        var category = await _db.CatalogCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
            return NotFound();

        var dto = new CategoryDetailDto(
            category.Id,
            category.Title,
            category.Slug,
            category.ContentHtml,
            category.IconUrl,
            category.ParentId,
            category.SortOrder,
            category.IsActive,
            category.Seo.MetaTitle,
            category.Seo.MetaDescription,
            category.Seo.Keywords
        );

        return Ok(dto);
    }


    [HttpPost]
    [RequirePermission("categories.create")]
    public async Task<ActionResult<CategoryDetailDto>> Create([FromBody] CategoryUpsertDto dto)
    {

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug is required.");

        dto.Slug = dto.Slug.Trim().ToLowerInvariant();


        var slugExists = await _db.CatalogCategories
            .AnyAsync(x => x.Slug == dto.Slug);

        if (slugExists)
            return Conflict("Slug already exists.");


        CatalogCategory? parent = null;
        if (dto.ParentId.HasValue)
        {
            parent = await _db.CatalogCategories
                .FirstOrDefaultAsync(x => x.Id == dto.ParentId.Value);

            if (parent == null)
                return BadRequest("Parent category not found.");
        }

        var entity = new CatalogCategory
        {
            Title = dto.Title.Trim(),
            Slug = dto.Slug,
            ContentHtml = dto.ContentHtml,
            IconUrl = dto.IconUrl,
            ParentId = dto.ParentId,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            Seo = new SeoMetadata
            {
                MetaTitle = dto.SeoTitle,
                MetaDescription = dto.SeoDescription,
                Keywords = dto.SeoKeywords
            }
        };

        _db.CatalogCategories.Add(entity);
        await _db.SaveChangesAsync();

        var result = new CategoryDetailDto(
            entity.Id,
            entity.Title,
            entity.Slug,
            entity.ContentHtml,
            entity.IconUrl,
            entity.ParentId,
            entity.SortOrder,
            entity.IsActive,
            entity.Seo.MetaTitle,
            entity.Seo.MetaDescription,
            entity.Seo.Keywords
        );

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, result);
    }


    [HttpPut("{id:guid}")]
    [RequirePermission("categories.update")]
    public async Task<ActionResult<CategoryDetailDto>> Update(
        Guid id,
        [FromBody] CategoryUpsertDto dto)
    {
        var entity = await _db.CatalogCategories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug is required.");

        dto.Slug = dto.Slug.Trim().ToLowerInvariant();

        var slugExists = await _db.CatalogCategories
            .AnyAsync(x => x.Slug == dto.Slug && x.Id != id);

        if (slugExists)
            return Conflict("Slug already exists.");

        if (dto.ParentId.HasValue)
        {
            if (dto.ParentId.Value == id)
                return BadRequest("Category cannot be parent of itself.");

            var parent = await _db.CatalogCategories
                .FirstOrDefaultAsync(x => x.Id == dto.ParentId.Value);

            if (parent == null)
                return BadRequest("Parent category not found.");

            var isCircular = await IsDescendantOf(id, dto.ParentId.Value);
            if (isCircular)
                return BadRequest("Circular category hierarchy is not allowed.");
        }

        entity.Title = dto.Title.Trim();
        entity.Slug = dto.Slug;
        entity.ContentHtml = dto.ContentHtml;
        entity.IconUrl = dto.IconUrl;
        entity.ParentId = dto.ParentId;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.Seo.MetaTitle = dto.SeoTitle;
        entity.Seo.MetaDescription = dto.SeoDescription;
        entity.Seo.Keywords = dto.SeoKeywords;

        await _db.SaveChangesAsync();

        var result = new CategoryDetailDto(
            entity.Id,
            entity.Title,
            entity.Slug,
            entity.ContentHtml,
            entity.IconUrl,
            entity.ParentId,
            entity.SortOrder,
            entity.IsActive,
            entity.Seo.MetaTitle,
            entity.Seo.MetaDescription,
            entity.Seo.Keywords
        );

        return Ok(result);
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("categories.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.CatalogCategories
            .Include(x => x.Children)
            .Include(x => x.ProductCategoryAssignments)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (entity == null)
            return NotFound();

        if (entity.Children.Any())
            return BadRequest("Category has child CatalogCategories. Remove or move them first.");

        if (entity.ProductCategoryAssignments.Any())
            return BadRequest("Category is assigned to products. Reassign or remove products first.");

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("trash")]
    [RequirePermission("categories.trash.view")]
    public async Task<ActionResult<PagedResult<CategoryListItemDto>>> Trash(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null,
    [FromQuery] Guid? parentId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.CatalogCategories
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.IsDeleted);

        if (parentId.HasValue)
            query = query.Where(x => x.ParentId == parentId.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(s) ||
                x.Slug.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CategoryListItemDto(
                c.Id,
                        c.Title,
                        c.Slug,
                        c.ParentId,
                        c.SortOrder,
                        c.IsActive,
                        c.ContentHtml,
                        c.IconUrl,
                        c.Seo.MetaTitle,
                        c.Seo.MetaDescription,
                        c.Seo.Keywords
            ))
            .ToListAsync();

        var result = new PagedResult<CategoryListItemDto>(items, total, page, pageSize);
        return Ok(result);
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("categories.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var e = await _db.CatalogCategories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();
        if (!e.IsDeleted) return BadRequest("این دسته حذف نشده است.");

        e.IsDeleted = false;
        e.DeletedAtUtc = null;
        e.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("categories.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var e = await _db.CatalogCategories
            .IgnoreQueryFilters()
            .Include(x => x.Children)
            .Include(x => x.ProductCategoryAssignments)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();

        if (e.Children.Any())
            return BadRequest("Category has child CatalogCategories. Remove or move them first.");

        if (e.ProductCategoryAssignments.Any())
            return BadRequest("Category is assigned to products. Reassign or remove products first.");

        _db.CatalogCategories.Remove(e);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("options")]
    public async Task<ActionResult<IEnumerable<CategoryOptionDto>>> Options(
    [FromQuery] bool onlyActive = true
)
    {
        var query = _db.CatalogCategories.AsNoTracking();

        if (onlyActive)
        {
            query = query.Where(x => x.IsActive && !x.IsDeleted);
        }

        var items = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Select(c => new CategoryOptionDto(
                c.Id,
                c.Title,
                c.ParentId,
                c.SortOrder,
                c.IconUrl
            ))
            .ToListAsync();

        return Ok(items);
    }


    private async Task<bool> IsDescendantOf(Guid categoryId, Guid candidateParentId)
    {
        var currentId = candidateParentId;

        while (true)
        {
            var cat = await _db.CatalogCategories
                .AsNoTracking()
                .Where(x => x.Id == currentId)
                .Select(x => new { x.Id, x.ParentId })
                .FirstOrDefaultAsync();

            if (cat == null)
                return false;

            if (cat.ParentId == null)
                return false;

            if (cat.ParentId == categoryId)
                return true;

            currentId = cat.ParentId.Value;
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.BlogCategory;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/blog-categories")]
[Authorize]
public class BlogCategoriesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public BlogCategoriesController(ShopDbContext db) => _db = db;


    [HttpGet]
    [RequirePermission("blog-categories.view")]
    public async Task<ActionResult<PagedResult<BlogCategoryListDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 50;

        var query = _db.BlogCategories
            .AsNoTracking()
            .Include(c => c.Parent)
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(c =>
                c.Name.Contains(term) ||
                c.Slug.Contains(term) ||
                (c.Description != null && c.Description.Contains(term)));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new BlogCategoryListDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ParentId,
                c.Parent != null ? c.Parent.Name : null,
                c.CreatedAtUtc,
                c.UpdatedAtUtc,
                c.DeletedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogCategoryListDto>(items, total, page, pageSize));
    }

    [HttpGet("options")]
    public async Task<ActionResult<IEnumerable<BlogCategoryOptionDto>>> Options()
    {
        var items = await _db.BlogCategories
            .AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .Select(c => new BlogCategoryOptionDto(c.Id, c.Name,c.ParentId))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("blog-categories.view")]
    public async Task<ActionResult<BlogCategoryUpsertDto>> Get(Guid id)
    {
        var c = await _db.BlogCategories.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (c == null) return NotFound();

        return Ok(new BlogCategoryUpsertDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            ParentId = c.ParentId,
            MetaTitle = c.Seo.MetaTitle,
            MetaDescription = c.Seo.MetaDescription,
            Keywords = c.Seo.Keywords,
            CanonicalUrl = c.Seo.CanonicalUrl,
            SeoMetaRobots = c.Seo.SeoMetaRobots,
            SeoSchemaJson = c.Seo.SeoSchemaJson,
            AutoGenerateSnippet = c.Seo.AutoGenerateSnippet,
            AutoGenerateHeadTags = c.Seo.AutoGenerateHeadTags,
            IncludeInSitemap = c.Seo.IncludeInSitemap
        });
    }

    [HttpPost]
    [RequirePermission("blog-categories.create")]
    public async Task<ActionResult<BlogCategoryUpsertDto>> Create([FromBody] BlogCategoryUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام دسته اجباری است.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug اجباری است.");

        var exists = await _db.BlogCategories
            .AnyAsync(c => c.Slug == dto.Slug && !c.IsDeleted);
        if (exists)
            return BadRequest("Slug تکراری است.");

        var entity = new BlogCategory
        {
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim(),
            Description = dto.Description,
            ParentId = dto.ParentId,
            Seo = new()
            {
                MetaTitle = dto.MetaTitle,
                MetaDescription = dto.MetaDescription,
                Keywords = dto.Keywords,
                CanonicalUrl = dto.CanonicalUrl,
                SeoMetaRobots = dto.SeoMetaRobots,
                SeoSchemaJson = dto.SeoSchemaJson,
                AutoGenerateSnippet = dto.AutoGenerateSnippet,
                AutoGenerateHeadTags = dto.AutoGenerateHeadTags,
                IncludeInSitemap = dto.IncludeInSitemap
            }
        };

        _db.BlogCategories.Add(entity);
        await _db.SaveChangesAsync();

        dto.Id = entity.Id;
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("blog-categories.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BlogCategoryUpsertDto dto)
    {
        var entity = await _db.BlogCategories.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (entity == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام دسته اجباری است.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug اجباری است.");

        var exists = await _db.BlogCategories
            .AnyAsync(c => c.Id != id && c.Slug == dto.Slug && !c.IsDeleted);
        if (exists)
            return BadRequest("Slug تکراری است.");

        entity.Name = dto.Name.Trim();
        entity.Slug = dto.Slug.Trim();
        entity.Description = dto.Description;
        entity.ParentId = dto.ParentId;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        entity.Seo.MetaTitle = dto.MetaTitle;
        entity.Seo.MetaDescription = dto.MetaDescription;
        entity.Seo.Keywords = dto.Keywords;
        entity.Seo.CanonicalUrl = dto.CanonicalUrl;
        entity.Seo.SeoMetaRobots = dto.SeoMetaRobots;
        entity.Seo.SeoSchemaJson = dto.SeoSchemaJson;
        entity.Seo.AutoGenerateSnippet = dto.AutoGenerateSnippet;
        entity.Seo.AutoGenerateHeadTags = dto.AutoGenerateHeadTags;
        entity.Seo.IncludeInSitemap = dto.IncludeInSitemap;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("blog-categories.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.BlogCategories.FirstOrDefaultAsync(c => c.Id == id);
        if (entity == null) return NotFound();

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("trash")]
    [RequirePermission("blog-categories.view")]
    public async Task<ActionResult<PagedResult<BlogCategoryListDto>>> Trash(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.BlogCategories
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(c => c.Parent)
            .Where(c => c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(c => c.Name.Contains(term) || c.Slug.Contains(term));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.DeletedAtUtc ?? c.UpdatedAtUtc ?? c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new BlogCategoryListDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ParentId,
                c.Parent != null ? c.Parent.Name : null,
                c.CreatedAtUtc,
                c.UpdatedAtUtc,
                c.DeletedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogCategoryListDto>(items, total, page, pageSize));
    }



    [HttpPost("{id:guid}/restore")]
    [RequirePermission("blog-categories.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var cat = await _db.BlogCategories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (cat == null) return NotFound();
        if (!cat.IsDeleted) return BadRequest("این دسته‌بندی حذف نشده است.");

        cat.IsDeleted = false;
        cat.DeletedAtUtc = null;
        cat.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }



    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("blog-categories.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var cat = await _db.BlogCategories
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (cat == null) return NotFound();

        _db.BlogCategories.Remove(cat);
        await _db.SaveChangesAsync();
        return NoContent();
    }


}

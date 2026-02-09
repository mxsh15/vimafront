using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.BlogTag;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/blog-tags")]
[Authorize]
public class BlogTagsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public BlogTagsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("blog-tags.view")]
    public async Task<ActionResult<PagedResult<BlogTagListDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 50;

        var query = _db.BlogTags
            .AsNoTracking()
            .Where(t => !t.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(t =>
                t.Name.Contains(term) ||
                t.Slug.Contains(term));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new BlogTagListDto(
                t.Id,
                t.Name,
                t.Slug,
                t.CreatedAtUtc,
                t.UpdatedAtUtc,
                t.DeletedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogTagListDto>(items, total, page, pageSize));
    }

    [HttpGet("options")]
    public async Task<ActionResult<IEnumerable<BlogTagOptionDto>>> Options()
    {
        var items = await _db.BlogTags
            .AsNoTracking()
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Name)
            .Select(t => new BlogTagOptionDto(t.Id, t.Name))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("blog-tags.view")]
    public async Task<ActionResult<BlogTagUpsertDto>> Get(Guid id)
    {
        var t = await _db.BlogTags.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (t == null) return NotFound();

        return Ok(new BlogTagUpsertDto
        {
            Id = t.Id,
            Name = t.Name,
            Slug = t.Slug,
            MetaTitle = t.Seo.MetaTitle,
            MetaDescription = t.Seo.MetaDescription,
            Keywords = t.Seo.Keywords,
            CanonicalUrl = t.Seo.CanonicalUrl,
            SeoMetaRobots = t.Seo.SeoMetaRobots,
            SeoSchemaJson = t.Seo.SeoSchemaJson,
            AutoGenerateSnippet = t.Seo.AutoGenerateSnippet,
            AutoGenerateHeadTags = t.Seo.AutoGenerateHeadTags,
            IncludeInSitemap = t.Seo.IncludeInSitemap
        });
    }

    [HttpPost]
    [RequirePermission("blog-tags.create")]
    public async Task<ActionResult<BlogTagUpsertDto>> Create([FromBody] BlogTagUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام برچسب اجباری است.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug اجباری است.");

        var exists = await _db.BlogTags.AnyAsync(t => t.Slug == dto.Slug && !t.IsDeleted);
        if (exists)
            return BadRequest("Slug تکراری است.");

        var entity = new BlogTag
        {
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim(),
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

        _db.BlogTags.Add(entity);
        await _db.SaveChangesAsync();

        dto.Id = entity.Id;
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("blog-tags.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BlogTagUpsertDto dto)
    {
        var entity = await _db.BlogTags.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        if (entity == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام برچسب اجباری است.");

        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug اجباری است.");

        var exists = await _db.BlogTags
            .AnyAsync(t => t.Id != id && t.Slug == dto.Slug && !t.IsDeleted);
        if (exists)
            return BadRequest("Slug تکراری است.");

        entity.Name = dto.Name.Trim();
        entity.Slug = dto.Slug.Trim();
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
    [RequirePermission("blog-tags.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.BlogTags.FirstOrDefaultAsync(t => t.Id == id);
        if (entity == null) return NotFound();

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("blog-tags.view")]
    public async Task<ActionResult<PagedResult<BlogTagListDto>>> Trash(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.BlogTags
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(t => t.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(t => t.Name.Contains(term) || t.Slug.Contains(term));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.DeletedAtUtc ?? t.UpdatedAtUtc ?? t.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new BlogTagListDto(
                t.Id,
                t.Name,
                t.Slug,
                t.CreatedAtUtc,
                t.UpdatedAtUtc,
                t.DeletedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogTagListDto>(items, total, page, pageSize));
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("blog-tags.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var tag = await _db.BlogTags
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (tag == null) return NotFound();
        if (!tag.IsDeleted) return BadRequest("این برچسب حذف نشده است.");

        tag.IsDeleted = false;
        tag.DeletedAtUtc = null;
        tag.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("blog-tags.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var tag = await _db.BlogTags
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (tag == null) return NotFound();

        _db.BlogTags.Remove(tag);
        await _db.SaveChangesAsync();
        return NoContent();
    }

}

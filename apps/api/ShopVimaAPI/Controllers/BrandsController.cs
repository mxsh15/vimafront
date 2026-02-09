using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Brand;
using ShopVima.Application.Dtos.Common;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/brands")]
[Authorize]
public class BrandsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public BrandsController(ShopDbContext db)
    {
        _db = db;
    }


    [HttpGet]
    [RequirePermission("brands.view")]
    public async Task<ActionResult<PagedResult<BrandDto>>> List([FromQuery] int page = 1,
                                                                [FromQuery] int pageSize = 20,
                                                                [FromQuery] string? q = null,
                                                                [FromQuery] string? status = null)
    {

        var rawQuery = HttpContext.Request.QueryString.Value;
        Console.WriteLine("Brands Raw Query: " + rawQuery);

        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Brands.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(s) ||
                x.Slug.Contains(s) ||
                (x.EnglishTitle != null && x.EnglishTitle.Contains(s))
            );
        }


        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(x => x.Status);
            else if (status == "inactive")
                query = query.Where(x => !x.Status);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new BrandDto(
                e.Id,
                e.Title,
                e.EnglishTitle,
                e.Slug,
                e.WebsiteUrl,
                e.ContentHtml,
                e.LogoUrl,
                new SeoMetadataDto(
                    e.Seo.MetaTitle,
                    e.Seo.MetaDescription,
                    e.Seo.Keywords,
                    e.Seo.CanonicalUrl,
                    e.Seo.AutoGenerateSnippet,
                    e.Seo.AutoGenerateHeadTags,
                    e.Seo.IncludeInSitemap
                ),
                e.CreatedAtUtc,
                e.UpdatedAtUtc,
                e.IsDeleted,
                Convert.ToBase64String(e.RowVersion),
                e.Status
            ))
            .ToListAsync();

        var result = new PagedResult<BrandDto>(items, total, page, pageSize);
        return Ok(result);
    }

    // GET /api/brands/{id}
    [HttpGet("{id:guid}")]
    [RequirePermission("brands.view")]
    public async Task<ActionResult<BrandDto>> Get(Guid id)
    {
        var e = await _db.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();

        var dto = new BrandDto(
            e.Id,
            e.Title,
            e.EnglishTitle,
            e.Slug,
            e.WebsiteUrl,
            e.ContentHtml,
            e.LogoUrl,
            new SeoMetadataDto(
                e.Seo.MetaTitle,
                e.Seo.MetaDescription,
                e.Seo.Keywords,
                e.Seo.CanonicalUrl,
                e.Seo.AutoGenerateSnippet,
                e.Seo.AutoGenerateHeadTags,
                e.Seo.IncludeInSitemap
            ),
            e.CreatedAtUtc,
            e.UpdatedAtUtc,
            e.IsDeleted,
            Convert.ToBase64String(e.RowVersion),
            e.Status
        );

        return Ok(dto);
    }

    // GET /api/brands/by-slug/{slug}
    [HttpGet("by-slug/{slug}")]
    public async Task<ActionResult<BrandDto>> GetBySlug(string slug)
    {
        var e = await _db.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug);

        if (e == null) return NotFound();

        var dto = new BrandDto(
            e.Id,
            e.Title,
            e.EnglishTitle,
            e.Slug,
            e.WebsiteUrl,
            e.ContentHtml,
            e.LogoUrl,
            new SeoMetadataDto(
                e.Seo.MetaTitle,
                e.Seo.MetaDescription,
                e.Seo.Keywords,
                e.Seo.CanonicalUrl,
                e.Seo.AutoGenerateSnippet,
                e.Seo.AutoGenerateHeadTags,
                e.Seo.IncludeInSitemap
            ),
            e.CreatedAtUtc,
            e.UpdatedAtUtc,
            e.IsDeleted,
            Convert.ToBase64String(e.RowVersion),
            e.Status
        );

        return Ok(dto);
    }

    // POST /api/brands
    [HttpPost]
    [RequirePermission("brands.create")]
    public async Task<ActionResult<BrandDto>> Create([FromBody] BrandCreateUpdateDto dto)
    {
        // اعتبارسنجی ساده‌ی Slug
        if (string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest("Slug is required.");

        var exists = await _db.Brands
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Slug == dto.Slug && !x.IsDeleted);

        if (exists) return Conflict("Slug already exists.");

        var deleted = await _db.Brands
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(x => x.Slug == dto.Slug && x.IsDeleted);

        if (deleted != null)
        {
            deleted.IsDeleted = false;
            deleted.DeletedAtUtc = null;
            deleted.UpdatedAtUtc = DateTime.UtcNow;

            deleted.Title = dto.Title;
            deleted.EnglishTitle = dto.EnglishTitle;
            deleted.Slug = dto.Slug;
            deleted.WebsiteUrl = dto.WebsiteUrl;
            deleted.ContentHtml = dto.ContentHtml;
            deleted.LogoUrl = dto.LogoUrl;

            if (dto.Seo is not null)
            {
                deleted.Seo.MetaTitle = dto.Seo.MetaTitle;
                deleted.Seo.MetaDescription = dto.Seo.MetaDescription;
                deleted.Seo.Keywords = dto.Seo.Keywords;
                deleted.Seo.CanonicalUrl = dto.Seo.CanonicalUrl;
                deleted.Seo.AutoGenerateSnippet = dto.Seo.AutoGenerateSnippet;
                deleted.Seo.AutoGenerateHeadTags = dto.Seo.AutoGenerateHeadTags;
                deleted.Seo.IncludeInSitemap = dto.Seo.IncludeInSitemap;
            }

            await _db.SaveChangesAsync();

            var restoredDto = new BrandDto(
                deleted.Id,
                deleted.Title,
                deleted.EnglishTitle,
                deleted.Slug,
                deleted.WebsiteUrl,
                deleted.ContentHtml,
                deleted.LogoUrl,
                new SeoMetadataDto(
                    deleted.Seo.MetaTitle,
                    deleted.Seo.MetaDescription,
                    deleted.Seo.Keywords,
                    deleted.Seo.CanonicalUrl,
                    deleted.Seo.AutoGenerateSnippet,
                    deleted.Seo.AutoGenerateHeadTags,
                    deleted.Seo.IncludeInSitemap
                ),
                deleted.CreatedAtUtc,
                deleted.UpdatedAtUtc,
                deleted.IsDeleted,
                Convert.ToBase64String(deleted.RowVersion),
                deleted.Status
            );

            return Ok(restoredDto);
        }

        var e = new Brand
        {
            Title = dto.Title,
            EnglishTitle = dto.EnglishTitle,
            Slug = dto.Slug,
            WebsiteUrl = dto.WebsiteUrl,
            ContentHtml = dto.ContentHtml,
            LogoUrl = dto.LogoUrl,
        };

        if (dto.Seo is not null)
        {
            e.Seo.MetaTitle = dto.Seo.MetaTitle;
            e.Seo.MetaDescription = dto.Seo.MetaDescription;
            e.Seo.Keywords = dto.Seo.Keywords;
            e.Seo.CanonicalUrl = dto.Seo.CanonicalUrl;
            e.Seo.AutoGenerateSnippet = dto.Seo.AutoGenerateSnippet;
            e.Seo.AutoGenerateHeadTags = dto.Seo.AutoGenerateHeadTags;
            e.Seo.IncludeInSitemap = dto.Seo.IncludeInSitemap;
        }

        _db.Brands.Add(e);
        await _db.SaveChangesAsync();

        var created = new BrandDto(
            e.Id,
            e.Title,
            e.EnglishTitle,
            e.Slug,
            e.WebsiteUrl,
            e.ContentHtml,
            e.LogoUrl,
            new SeoMetadataDto(
                e.Seo.MetaTitle,
                e.Seo.MetaDescription,
                e.Seo.Keywords,
                e.Seo.CanonicalUrl,
                e.Seo.AutoGenerateSnippet,
                e.Seo.AutoGenerateHeadTags,
                e.Seo.IncludeInSitemap
            ),
            e.CreatedAtUtc,
            e.UpdatedAtUtc,
            e.IsDeleted,
            Convert.ToBase64String(e.RowVersion),
            e.Status
        );

        return CreatedAtAction(nameof(Get), new { id = e.Id }, created);
    }

    // PUT /api/brands/{id}
    [HttpPut("{id:guid}")]
    [RequirePermission("brands.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BrandCreateUpdateDto dto)
    {
        var e = await _db.Brands.FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();

        // کنترل همزمانی با RowVersion (base64 ورودی)
        if (!string.IsNullOrWhiteSpace(dto.RowVersion))
        {
            var original = Convert.FromBase64String(dto.RowVersion);
            _db.Entry(e).Property(x => x.RowVersion).OriginalValue = original;
        }

        e.Title = dto.Title;
        e.EnglishTitle = dto.EnglishTitle;
        e.Slug = dto.Slug;
        e.WebsiteUrl = dto.WebsiteUrl;
        e.ContentHtml = dto.ContentHtml;
        e.LogoUrl = dto.LogoUrl;

        if (dto.Seo is not null)
        {
            e.Seo.MetaTitle = dto.Seo.MetaTitle;
            e.Seo.MetaDescription = dto.Seo.MetaDescription;
            e.Seo.Keywords = dto.Seo.Keywords;
            e.Seo.CanonicalUrl = dto.Seo.CanonicalUrl;
            e.Seo.AutoGenerateSnippet = dto.Seo.AutoGenerateSnippet;
            e.Seo.AutoGenerateHeadTags = dto.Seo.AutoGenerateHeadTags;
            e.Seo.IncludeInSitemap = dto.Seo.IncludeInSitemap;
        }

        //try
        //{
        await _db.SaveChangesAsync();
        //}
        //catch (DbUpdateConcurrencyException)
        //{
        //    return Conflict("Concurrency conflict. Please refresh and try again.");
        //}
        //catch (DbUpdateException ex) when (ex.InnerException != null && ex.InnerException.Message.Contains("IX_Brands_Slug"))
        //{
        //    // اگر ایندکس یونیک Slug ثبت شده، کانفلیکت شفاف‌تر بده
        //    return Conflict("Slug already exists.");
        //}

        return NoContent();
    }

    // DELETE /api/brands/{id}
    [HttpDelete("{id:guid}")]
    [RequirePermission("brands.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var e = await _db.Brands.FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();

        // Soft-Delete مطابق BaseEntity
        e.IsDeleted = true;
        e.DeletedAtUtc = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict("Concurrency conflict. Please refresh and try again.");
        }

        return NoContent();
    }

    // GET /api/brands/trash
    [HttpGet("trash")]
    [RequirePermission("brands.trash.view")]
    public async Task<ActionResult<PagedResult<BrandDto>>> Trash([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Brands
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(s) ||
                (x.EnglishTitle != null && x.EnglishTitle.Contains(s)) ||
                x.Slug.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.UpdatedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new BrandDto(
                e.Id, e.Title, e.EnglishTitle, e.Slug, e.WebsiteUrl, e.ContentHtml, e.LogoUrl,
                new SeoMetadataDto(
                    e.Seo.MetaTitle, e.Seo.MetaDescription, e.Seo.Keywords, e.Seo.CanonicalUrl,
                    e.Seo.AutoGenerateSnippet, e.Seo.AutoGenerateHeadTags, e.Seo.IncludeInSitemap
                ),
                e.CreatedAtUtc, e.UpdatedAtUtc, e.IsDeleted, Convert.ToBase64String(e.RowVersion),
                e.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<BrandDto>(items, total, page, pageSize));
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("brands.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var e = await _db.Brands
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();
        if (!e.IsDeleted) return BadRequest("این برند حذف شده است");

        e.IsDeleted = false;
        e.DeletedAtUtc = null;
        e.UpdatedAtUtc = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException != null && ex.InnerException.Message.Contains("IX_Brands_Slug"))
        {
            return Conflict("Cannot restore: slug is already used by another brand.");
        }

        return NoContent();
    }


    // DELETE /api/brands/{id}/hard
    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("brands.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var e = await _db.Brands
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();

        _db.Brands.Remove(e);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict("Concurrency conflict. Please refresh and try again.");
        }

        return NoContent();
    }
}

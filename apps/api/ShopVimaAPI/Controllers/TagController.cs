using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Tag;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/tags")]
[Authorize]
public class TagsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public TagsController(ShopDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [RequirePermission("tags.view")]
    public async Task<ActionResult<PagedResult<TagListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page < 1) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.Tags
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(t =>
                t.Name.Contains(s) ||
                t.Slug.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TagListItemDto(
                t.Id,
                t.Name,
                t.Slug,
                t.CreatedAtUtc,
                t.UpdatedAtUtc,
                t.IsDeleted
            ))
            .ToListAsync();

        return Ok(new PagedResult<TagListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("tags.view")]
    public async Task<ActionResult<TagDto>> Get(Guid id)
    {
        var t = await _db.Tags.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (t == null) return NotFound();

        var dto = new TagDto(
            t.Id,
            t.Name,
            t.Slug,
            t.CreatedAtUtc,
            t.UpdatedAtUtc,
            t.IsDeleted,
            Convert.ToBase64String(t.RowVersion));

        return Ok(dto);
    }


    [HttpPost]
    [RequirePermission("tags.create")]
    public async Task<ActionResult<TagDto>> Create(TagCreateUpdateDto input)
    {
        var entity = new Tag
        {
            Name = input.Name.Trim(),
            Slug = input.Slug.Trim()
        };

        _db.Tags.Add(entity);
        await _db.SaveChangesAsync();

        var dto = new TagDto(
            entity.Id,
            entity.Name,
            entity.Slug,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.IsDeleted,
            Convert.ToBase64String(entity.RowVersion));

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, dto);
    }


    [HttpPut("{id:guid}")]
    [RequirePermission("tags.update")]
    public async Task<ActionResult<TagDto>> Update(Guid id, TagCreateUpdateDto input)
    {
        var t = await _db.Tags.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (t == null) return NotFound();

        if (!string.IsNullOrEmpty(input.RowVersion))
        {
            try
            {
                var clientVersion = Convert.FromBase64String(input.RowVersion);
                if (!t.RowVersion.SequenceEqual(clientVersion))
                    return Conflict("اطلاعات توسط کاربر دیگری تغییر کرده است.");
            }
            catch (FormatException)
            {
                return BadRequest("فرمت RowVersion نامعتبر است.");
            }
        }

        t.Name = input.Name.Trim();
        t.Slug = input.Slug.Trim();
        t.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new TagDto(
            t.Id,
            t.Name,
            t.Slug,
            t.CreatedAtUtc,
            t.UpdatedAtUtc,
            t.IsDeleted,
            Convert.ToBase64String(t.RowVersion)
        );

        return Ok(dto);
    }



    [HttpDelete("{id:guid}")]
    [RequirePermission("tags.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var t = await _db.Tags.FirstOrDefaultAsync(x => x.Id == id);
        if (t == null) return NotFound();

        t.IsDeleted = true;
        t.DeletedAtUtc = DateTime.UtcNow;
        t.Status = false;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("deleted")]
    [RequirePermission("tags.trash.view")]
    public async Task<ActionResult<PagedResult<TagDto>>> ListDeleted(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null)
    {
        var query = _db.Tags.Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(x => x.Name.Contains(q) || x.Slug.Contains(q));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TagDto(
                x.Id,
                x.Name,
                x.Slug,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.IsDeleted,
                Convert.ToBase64String(x.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<TagDto>(items, total, page, pageSize));
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("tags.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var t = await _db.Tags.FirstOrDefaultAsync(x => x.Id == id);
        if (t == null) return NotFound();

        t.IsDeleted = false;
        t.DeletedAtUtc = null;
        t.Status = true;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("tags.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var t = await _db.Tags.FirstOrDefaultAsync(x => x.Id == id);
        if (t == null) return NotFound();

        _db.Tags.Remove(t);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
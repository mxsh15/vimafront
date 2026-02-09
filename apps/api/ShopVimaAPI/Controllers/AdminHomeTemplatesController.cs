using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.HomeTemplate;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/home-templates")]
//[Authorize]
public sealed class AdminHomeTemplatesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminHomeTemplatesController(ShopDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<object>> List()
    {
        var store = await _db.StoreSettings.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        var activeId = store?.ActiveHomeTemplateId;

        var items = await _db.HomeTemplates.AsNoTracking()
            .Where(x => !x.IsDeleted)
            .Include(x => x.ThumbnailMediaAsset)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new AdminHomeTemplateListItemDto(
                x.Id,
                x.Title,
                x.Slug,
                x.Description,
                x.ThumbnailMediaAsset != null ? x.ThumbnailMediaAsset.Url : null,
                x.IsSystem,
                x.IsEnabled,
                activeId.HasValue && x.Id == activeId.Value,
                x.Sections.Count(s => !s.IsDeleted),
                x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdminHomeTemplateDetailDto>> Get(Guid id)
    {
        var store = await _db.StoreSettings.AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        var activeId = store?.ActiveHomeTemplateId;

        var x = await _db.HomeTemplates.AsNoTracking()
            .Where(t => !t.IsDeleted && t.Id == id)
            .Include(t => t.ThumbnailMediaAsset)
            .Include(t => t.Sections.Where(s => !s.IsDeleted))
            .Select(t => new AdminHomeTemplateDetailDto(
                t.Id,
                t.Title,
                t.Slug,
                t.Description,
                t.ThumbnailMediaAssetId,
                t.ThumbnailMediaAsset != null ? t.ThumbnailMediaAsset.Url : null,
                t.IsSystem,
                t.IsEnabled,
                activeId.HasValue && t.Id == activeId.Value,
                t.Sections
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new AdminHomeTemplateSectionDto(
                        s.Id, s.Type, s.Title, s.SortOrder, s.IsEnabled, s.ConfigJson
                    ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        if (x is null) return NotFound();
        return Ok(x);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] AdminHomeTemplateUpsertDto dto)
    {
        dto = dto with
        {
            Title = dto.Title.Trim(),
            Slug = dto.Slug.Trim().ToLowerInvariant()
        };

        var slugExists = await _db.HomeTemplates.AsNoTracking()
            .AnyAsync(x => !x.IsDeleted && x.Slug == dto.Slug);
        if (slugExists) return BadRequest(new { problem = "Slug already exists." });

        if (dto.ThumbnailMediaAssetId.HasValue)
        {
            var ok = await _db.MediaAssets.AsNoTracking()
                .AnyAsync(x => x.Id == dto.ThumbnailMediaAssetId && !x.IsDeleted);
            if (!ok) return BadRequest(new { problem = "Invalid ThumbnailMediaAssetId" });
        }

        var entity = new HomeTemplate
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            ThumbnailMediaAssetId = dto.ThumbnailMediaAssetId,
            IsSystem = false,
            IsEnabled = dto.IsEnabled
        };

        _db.HomeTemplates.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, new { entity.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] AdminHomeTemplateUpsertDto dto)
    {
        var entity = await _db.HomeTemplates
            .FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();

        var newSlug = dto.Slug.Trim().ToLowerInvariant();

        var slugExists = await _db.HomeTemplates.AsNoTracking()
            .AnyAsync(x => !x.IsDeleted && x.Id != id && x.Slug == newSlug);
        if (slugExists) return BadRequest(new { problem = "Slug already exists." });

        if (dto.ThumbnailMediaAssetId.HasValue)
        {
            var ok = await _db.MediaAssets.AsNoTracking()
                .AnyAsync(x => x.Id == dto.ThumbnailMediaAssetId && !x.IsDeleted);
            if (!ok) return BadRequest(new { problem = "Invalid ThumbnailMediaAssetId" });
        }

        entity.Title = dto.Title.Trim();
        entity.Slug = newSlug;
        entity.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        entity.ThumbnailMediaAssetId = dto.ThumbnailMediaAssetId;
        entity.IsEnabled = dto.IsEnabled;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/sections")]
    public async Task<ActionResult> SaveSections(Guid id, [FromBody] AdminHomeTemplateSaveSectionsDto dto)
    {
        var strategy = _db.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            var template = await _db.HomeTemplates
                .FirstOrDefaultAsync(t => !t.IsDeleted && t.Id == id);

            if (template is null)
                throw new InvalidOperationException("Template not found");

            var now = DateTime.UtcNow;

            await _db.HomeTemplateSections
                .Where(s => s.HomeTemplateId == id)
                .ExecuteDeleteAsync();

            var sections = dto.Sections
                .OrderBy(x => x.SortOrder)
                .Select((x, idx) => new HomeTemplateSection
                {
                    HomeTemplateId = id,
                    Type = x.Type,
                    Title = string.IsNullOrWhiteSpace(x.Title) ? x.Type.ToString() : x.Title.Trim(),
                    SortOrder = idx + 1,
                    IsEnabled = x.IsEnabled,
                    ConfigJson = string.IsNullOrWhiteSpace(x.ConfigJson) ? "{}" : x.ConfigJson,
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now,
                })
                .ToList();

            _db.HomeTemplateSections.AddRange(sections);

            template.UpdatedAtUtc = now;
            await _db.SaveChangesAsync();

            await tx.CommitAsync();
        });

        return NoContent();
    }


    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult> Activate(Guid id)
    {
        var templateOk = await _db.HomeTemplates.AsNoTracking()
            .AnyAsync(x => x.Id == id && !x.IsDeleted && x.IsEnabled);
        if (!templateOk) return BadRequest(new { problem = "Template not found or disabled." });

        var store = await _db.StoreSettings
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (store is null)
        {
            store = new StoreSettings();
            _db.StoreSettings.Add(store);
        }

        store.ActiveHomeTemplateId = id;
        store.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/clone")]
    public async Task<ActionResult<object>> Clone(Guid id)
    {
        var src = await _db.HomeTemplates.AsNoTracking()
            .Where(x => !x.IsDeleted && x.Id == id)
            .Include(x => x.Sections.Where(s => !s.IsDeleted))
            .FirstOrDefaultAsync();

        if (src is null) return NotFound();

        var baseSlug = $"{src.Slug}-copy";
        var slug = baseSlug;
        var i = 2;
        while (await _db.HomeTemplates.AnyAsync(x => !x.IsDeleted && x.Slug == slug))
        {
            slug = $"{baseSlug}-{i++}";
        }

        var clone = new HomeTemplate
        {
            Title = $"{src.Title} (کپی)",
            Slug = slug,
            Description = src.Description,
            ThumbnailMediaAssetId = src.ThumbnailMediaAssetId,
            IsSystem = false,
            IsEnabled = true
        };

        _db.HomeTemplates.Add(clone);
        await _db.SaveChangesAsync();

        var sections = src.Sections
            .OrderBy(s => s.SortOrder)
            .Select(s => new HomeTemplateSection
            {
                HomeTemplateId = clone.Id,
                Type = s.Type,
                Title = s.Title,
                SortOrder = s.SortOrder,
                IsEnabled = s.IsEnabled,
                ConfigJson = s.ConfigJson
            })
            .ToList();

        _db.HomeTemplateSections.AddRange(sections);
        await _db.SaveChangesAsync();

        return Ok(new { id = clone.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _db.HomeTemplates.FirstOrDefaultAsync(x => !x.IsDeleted && x.Id == id);
        if (entity is null) return NotFound();
        if (entity.IsSystem) return BadRequest(new { problem = "System templates cannot be deleted." });

        entity.IsDeleted = true;
        entity.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

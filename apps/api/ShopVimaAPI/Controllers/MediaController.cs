using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.MediaAsset;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/media")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IWebHostEnvironment _env;

    public MediaController(ShopDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }


    [HttpGet]
    [RequirePermission("media.view")]
    public async Task<ActionResult<object>> GetList(
        [FromQuery] MediaUsage? usage,
        [FromQuery] MediaKind? kind,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        var query = _db.MediaAssets.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            q = q.Trim().ToLower();

            query = query.Where(x =>
                (x.Title ?? "").ToLower().Contains(q) ||
                (x.AltText ?? "").ToLower().Contains(q) ||
                (x.FileName ?? "").ToLower().Contains(q) ||
                (x.Url ?? "").ToLower().Contains(q)
            );
        }


        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new MediaAssetDto(
                x.Id,
                x.Url,
                x.ThumbnailUrl,
                x.AltText,
                x.Title,
                x.Kind,
                x.Provider,
                x.Usage,
                x.FileSize,
                x.ContentType
            ))
            .ToListAsync();

        return Ok(new
        {
            items,
            page,
            pageSize,
            totalCount
        });
    }


    public sealed class MediaUploadRequest
    {
        [FromForm(Name = "file")]
        public IFormFile File { get; set; } = default!;

        [FromForm(Name = "usage")]
        public MediaUsage Usage { get; set; } = MediaUsage.General;
    }



    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(20_000_000)] // 20MB
    [RequirePermission("media.create")]
    public async Task<ActionResult<MediaAssetDto>> Upload([FromForm] MediaUploadRequest req)
    {
        var file = req.File;
        var usage = req.Usage;

        if (file == null || file.Length == 0)
            return UnprocessableEntity(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["file"] = new[] { "File is required" }
            }));

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "media");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName)}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/media/{fileName}";

        var entity = new MediaAsset
        {
            FileName = file.FileName,
            Url = relativeUrl,
            ThumbnailUrl = null,
            AltText = Path.GetFileNameWithoutExtension(file.FileName),
            Kind = MediaKind.Image,
            Provider = MediaProvider.Upload,
            Usage = usage,
            FileSize = file.Length,
            ContentType = file.ContentType
        };

        _db.MediaAssets.Add(entity);
        await _db.SaveChangesAsync();

        var dto = new MediaAssetDto(
            entity.Id,
            entity.Url,
            entity.ThumbnailUrl,
            entity.AltText,
            entity.Title,
            entity.Kind,
            entity.Provider,
            entity.Usage,
            entity.FileSize,
            entity.ContentType
        );

        return Ok(dto);
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("media.view")]
    public async Task<ActionResult<MediaAssetDto>> Get(Guid id)
    {
        var e = await _db.MediaAssets.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return NotFound();

        var dto = new MediaAssetDto(
            e.Id,
            e.Url,
            e.ThumbnailUrl,
            e.AltText,
            e.Title,
            e.Kind,
            e.Provider,
            e.Usage,
            e.FileSize,
            e.ContentType
        );

        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("media.update")]
    public async Task<ActionResult<MediaAssetDto>> Update(
        Guid id,
        [FromBody] MediaUpdateDto dto)
    {
        var e = await _db.MediaAssets.FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();

        if (dto.AltText != null)
            e.AltText = dto.AltText;

        if (dto.Title != null)
            e.Title = dto.Title;

        if (dto.Usage.HasValue)
            e.Usage = dto.Usage.Value;

        await _db.SaveChangesAsync();

        var result = new MediaAssetDto(
            e.Id,
            e.Url,
            e.ThumbnailUrl,
            e.AltText,
            e.Title,
            e.Kind,
            e.Provider,
            e.Usage,
            e.FileSize,
            e.ContentType
        );

        return Ok(result);
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("media.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var e = await _db.MediaAssets.FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();

        _db.MediaAssets.Remove(e);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("resolve")]
    public async Task<ActionResult<Guid>> Resolve([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest();

        var asset = await _db.MediaAssets
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Url == url || x.ThumbnailUrl == url
            );

        if (asset == null) return NotFound();

        return Ok(asset.Id);
    }
}
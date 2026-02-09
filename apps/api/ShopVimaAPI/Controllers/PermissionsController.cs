using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Permission;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/permissions")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PermissionsController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("permissions.view")]
    public async Task<ActionResult<PagedResult<PermissionListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? category = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Permissions
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p =>
                p.Name.Contains(s) ||
                (p.DisplayName != null && p.DisplayName.Contains(s)) ||
                (p.Description != null && p.Description.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(p => p.Status);
            else if (status == "inactive")
                query = query.Where(p => !p.Status);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.Category)
            .ThenBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PermissionListItemDto(
                p.Id,
                p.Name,
                p.DisplayName,
                p.Category,
                p.RolePermissions.Count,
                p.CreatedAtUtc,
                p.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<PermissionListItemDto>(items, total, page, pageSize));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var categories = await _db.Permissions
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.Category != null)
            .Select(p => p.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("permissions.view")]
    public async Task<ActionResult<PermissionDto>> Get(Guid id)
    {
        var permission = await _db.Permissions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        if (permission == null) return NotFound();

        return Ok(new PermissionDto(
            permission.Id,
            permission.Name,
            permission.DisplayName,
            permission.Description,
            permission.Category,
            permission.CreatedAtUtc,
            permission.Status
        ));
    }

    [HttpPost]
    [RequirePermission("permissions.create")]
    public async Task<ActionResult<PermissionDto>> Create([FromBody] PermissionCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام دسترسی الزامی است");

        if (await _db.Permissions.AnyAsync(p => p.Name == dto.Name && !p.IsDeleted))
            return Conflict("این نام دسترسی قبلاً استفاده شده است");

        var permission = new Permission
        {
            Name = dto.Name,
            DisplayName = dto.DisplayName,
            Description = dto.Description,
            Category = dto.Category,
            Status = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Permissions.Add(permission);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = permission.Id }, new PermissionDto(
            permission.Id,
            permission.Name,
            permission.DisplayName,
            permission.Description,
            permission.Category,
            permission.CreatedAtUtc,
            permission.Status
        ));
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("permissions.update")]
    public async Task<ActionResult<PermissionDto>> Update(Guid id, [FromBody] PermissionUpdateDto dto)
    {
        var permission = await _db.Permissions.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        if (permission == null) return NotFound();

        if (dto.Name != permission.Name && 
            await _db.Permissions.AnyAsync(p => p.Name == dto.Name && p.Id != id && !p.IsDeleted))
            return Conflict("این نام دسترسی قبلاً استفاده شده است");

        permission.Name = dto.Name;
        permission.DisplayName = dto.DisplayName;
        permission.Description = dto.Description;
        permission.Category = dto.Category;
        permission.Status = dto.Status;
        permission.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new PermissionDto(
            permission.Id,
            permission.Name,
            permission.DisplayName,
            permission.Description,
            permission.Category,
            permission.CreatedAtUtc,
            permission.Status
        ));
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("permissions.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var permission = await _db.Permissions.FirstOrDefaultAsync(p => p.Id == id);
        if (permission == null) return NotFound();

        permission.IsDeleted = true;
        permission.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("permissions.trash.view")]
    public async Task<ActionResult<PagedResult<PermissionListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Permissions
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(p => p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p =>
                p.Name.Contains(s) ||
                (p.DisplayName != null && p.DisplayName.Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.DeletedAtUtc ?? p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PermissionListItemDto(
                p.Id,
                p.Name,
                p.DisplayName,
                p.Category,
                p.RolePermissions.Count,
                p.CreatedAtUtc,
                p.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<PermissionListItemDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("permissions.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var permission = await _db.Permissions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (permission == null) return NotFound();
        if (!permission.IsDeleted) return BadRequest("این دسترسی حذف نشده است");

        permission.IsDeleted = false;
        permission.DeletedAtUtc = null;
        permission.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("permissions.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var permission = await _db.Permissions
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (permission == null) return NotFound();

        _db.Permissions.Remove(permission);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}


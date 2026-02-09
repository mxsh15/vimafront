using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Role;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public RolesController(ShopDbContext db) => _db = db;

    [HttpGet]
    [RequirePermission("roles.view")]
    public async Task<ActionResult<PagedResult<RoleListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Roles
            .AsNoTracking()
            .Where(r => !r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r => r.Name.Contains(s) || 
                (r.Description != null && r.Description.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(r => r.Status);
            else if (status == "inactive")
                query = query.Where(r => !r.Status);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RoleListItemDto(
                r.Id,
                r.Name,
                r.Description,
                r.Users.Count,
                r.RolePermissions.Count,
                r.CreatedAtUtc,
                r.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<RoleListItemDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("roles.view")]
    public async Task<ActionResult<RoleDetailDto>> Get(Guid id)
    {
        var role = await _db.Roles
            .AsNoTracking()
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if (role == null) return NotFound();

        var permissions = role.RolePermissions
            .Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Name,
                rp.Permission.DisplayName,
                rp.Permission.Category
            ))
            .ToList();

        return Ok(new RoleDetailDto(
            role.Id,
            role.Name,
            role.Description,
            permissions,
            role.CreatedAtUtc,
            role.Status
        ));
    }

    [HttpPost]
    [RequirePermission("roles.create")]
    public async Task<ActionResult<RoleDto>> Create([FromBody] RoleCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("نام نقش الزامی است");

        if (await _db.Roles.AnyAsync(r => r.Name == dto.Name && !r.IsDeleted))
            return Conflict("این نام نقش قبلاً استفاده شده است");

        var role = new Role
        {
            Name = dto.Name,
            Description = dto.Description,
            Status = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Roles.Add(role);

        // اضافه کردن دسترسی‌ها
        if (dto.PermissionIds != null && dto.PermissionIds.Any())
        {
            var permissions = await _db.Permissions
                .Where(p => dto.PermissionIds.Contains(p.Id) && !p.IsDeleted)
                .ToListAsync();

            foreach (var permission in permissions)
            {
                role.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id,
                    CreatedAtUtc = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = role.Id }, new RoleDto(
            role.Id,
            role.Name,
            role.Description,
            role.CreatedAtUtc,
            role.Status
        ));
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("roles.update")]
    public async Task<ActionResult<RoleDto>> Update(Guid id, [FromBody] RoleUpdateDto dto)
    {
        var role = await _db.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

        if (role == null) return NotFound();

        if (dto.Name != role.Name && await _db.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != id && !r.IsDeleted))
            return Conflict("این نام نقش قبلاً استفاده شده است");

        role.Name = dto.Name;
        role.Description = dto.Description;
        role.Status = dto.Status;
        role.UpdatedAtUtc = DateTime.UtcNow;

        // به‌روزرسانی دسترسی‌ها
        var currentPermissionIds = role.RolePermissions.Select(rp => rp.PermissionId).ToList();
        var newPermissionIds = dto.PermissionIds ?? new List<Guid>();

        // حذف دسترسی‌های حذف شده
        var toRemove = role.RolePermissions
            .Where(rp => !newPermissionIds.Contains(rp.PermissionId))
            .ToList();
        foreach (var rp in toRemove)
        {
            _db.RolePermissions.Remove(rp);
        }

        // اضافه کردن دسترسی‌های جدید
        var toAdd = newPermissionIds
            .Where(pid => !currentPermissionIds.Contains(pid))
            .ToList();

        if (toAdd.Any())
        {
            var permissions = await _db.Permissions
                .Where(p => toAdd.Contains(p.Id) && !p.IsDeleted)
                .ToListAsync();

            foreach (var permission in permissions)
            {
                role.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id,
                    CreatedAtUtc = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new RoleDto(
            role.Id,
            role.Name,
            role.Description,
            role.CreatedAtUtc,
            role.Status
        ));
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("roles.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Id == id);
        if (role == null) return NotFound();

        role.IsDeleted = true;
        role.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("roles.trash.view")]
    public async Task<ActionResult<PagedResult<RoleListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Roles
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(r => r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r => r.Name.Contains(s) || 
                (r.Description != null && r.Description.Contains(s)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.DeletedAtUtc ?? r.UpdatedAtUtc ?? r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RoleListItemDto(
                r.Id,
                r.Name,
                r.Description,
                r.Users.Count,
                r.RolePermissions.Count,
                r.CreatedAtUtc,
                r.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<RoleListItemDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("roles.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var role = await _db.Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound();
        if (!role.IsDeleted) return BadRequest("این نقش حذف نشده است");

        role.IsDeleted = false;
        role.DeletedAtUtc = null;
        role.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("roles.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var role = await _db.Roles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null) return NotFound();

        _db.Roles.Remove(role);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}


using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.User;
using ShopVima.Application.Services;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public UsersController(ShopDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    [RequirePermission("users.view")]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? role = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Users
            .AsNoTracking()
            .Include(u => u.UserRole)
            .Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(u =>
                u.Email.Contains(s) ||
                u.FirstName.Contains(s) ||
                u.LastName.Contains(s) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            if (Enum.TryParse<UserRole>(role, true, out var roleEnum))
                query = query.Where(u => u.Role == roleEnum);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(u => u.Status);
            else if (status == "inactive")
                query = query.Where(u => !u.Status);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListItemDto(
                u.Id,
                u.Email,
                u.FullName,
                u.PhoneNumber,
                u.Role,
                u.RoleId,
                u.UserRole != null ? u.UserRole.Name : null,
                u.EmailVerified,
                u.LastLoginAt,
                u.CreatedAtUtc,
                u.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<UserListItemDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("users.view")]
    public async Task<ActionResult<UserDto>> Get(Guid id)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRole)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        if (user == null) return NotFound();

        var vendorIds = await _db.VendorMembers
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => vm.VendorId)
            .ToListAsync();

        return Ok(new UserDto(
            user.Id,
            user.Email,
            user.PhoneNumber,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            user.RoleId,
            user.UserRole != null ? user.UserRole.Name : null,
            vendorIds,
            user.EmailVerified,
            user.LastLoginAt,
            user.CreatedAtUtc,
            user.Status
        ));
    }

    [HttpPost]
    [RequirePermission("users.create")]
    public async Task<ActionResult<UserDto>> Create([FromBody] UserCreateDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLowerInvariant() && !u.IsDeleted))
            return Conflict("این ایمیل قبلاً ثبت شده است");

        var user = new User
        {
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Role = dto.Role,
            RoleId = dto.RoleId,
            EmailVerified = false,
            Status = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();


        if (dto.VendorIds != null && dto.VendorIds.Count > 0)
        {
            var now = DateTime.UtcNow;

            // حذف تکراری‌ها
            var vendorIdss = dto.VendorIds.Distinct().ToList();

            foreach (var vid in vendorIdss)
            {
                var vendorMember = new VendorMember
                {
                    VendorId = vid,
                    UserId = user.Id,
                    Role = "Owner",
                    IsActive = true,
                    CreatedAtUtc = now
                };
                _db.VendorMembers.Add(vendorMember);
            }

            await _db.SaveChangesAsync();
        }

        await _db.Entry(user).Reference(u => u.UserRole).LoadAsync();

        var vendorIds = await _db.VendorMembers
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => vm.VendorId)
            .ToListAsync();

        return CreatedAtAction(nameof(Get), new { id = user.Id }, new UserDto(
            user.Id,
            user.Email,
            user.PhoneNumber,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            user.RoleId,
            user.UserRole != null ? user.UserRole.Name : null,
            vendorIds,
            user.EmailVerified,
            user.LastLoginAt,
            user.CreatedAtUtc,
            user.Status
        ));
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("users.update")]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UserUpdateDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        if (user == null) return NotFound();

        if (dto.Email.ToLowerInvariant() != user.Email &&
            await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLowerInvariant() && u.Id != id && !u.IsDeleted))
            return Conflict("این ایمیل قبلاً ثبت شده است");

        user.Email = dto.Email.ToLowerInvariant();
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.PhoneNumber = dto.PhoneNumber;
        user.Role = dto.Role;
        user.RoleId = dto.RoleId;
        user.Status = dto.Status;
        user.UpdatedAtUtc = DateTime.UtcNow;

        // مدیریت VendorIds از طریق VendorMember (Sync کامل)
        var newVendorIds = (dto.VendorIds ?? new List<Guid>())
            .Distinct()
            .ToList();

        var now2 = DateTime.UtcNow;

        // عضویت‌های موجود کاربر (فعال و غیرفعال)
        var memberships = await _db.VendorMembers
            .Where(vm => vm.UserId == user.Id)
            .ToListAsync();

        // 1) برای هر VendorId جدید: عضویت را ایجاد/فعال کن
        foreach (var vid in newVendorIds)
        {
            var existing = memberships.FirstOrDefault(x => x.VendorId == vid);
            if (existing == null)
            {
                _db.VendorMembers.Add(new VendorMember
                {
                    VendorId = vid,
                    UserId = user.Id,
                    Role = "Owner", // یا "Member"
                    IsActive = true,
                    CreatedAtUtc = now2
                });
            }
            else
            {
                existing.IsActive = true;
                existing.Role = "Owner"; // یا "Member"
                existing.UpdatedAtUtc = now2;
            }
        }

        // 2) هر عضویتی که در لیست جدید نیست را غیرفعال کن (حذف نرم)
        foreach (var m in memberships)
        {
            if (m.IsActive && !newVendorIds.Contains(m.VendorId))
            {
                m.IsActive = false;
                m.UpdatedAtUtc = now2;
            }
        }


        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = _passwordHasher.HashPassword(dto.Password);
        }

        await _db.SaveChangesAsync();
        await _db.Entry(user).Reference(u => u.UserRole).LoadAsync();


        var vendorIds = await _db.VendorMembers
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => vm.VendorId)
            .ToListAsync();

        return Ok(new UserDto(
            user.Id,
            user.Email,
            user.PhoneNumber,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            user.RoleId,
            user.UserRole != null ? user.UserRole.Name : null,
            vendorIds,
            user.EmailVerified,
            user.LastLoginAt,
            user.CreatedAtUtc,
            user.Status
        ));
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("users.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        user.IsDeleted = true;
        user.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("users.trash.view")]
    public async Task<ActionResult<PagedResult<UserListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(u => u.UserRole)
            .Where(u => u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(u =>
                u.Email.Contains(s) ||
                u.FirstName.Contains(s) ||
                u.LastName.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.DeletedAtUtc ?? u.UpdatedAtUtc ?? u.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListItemDto(
                u.Id,
                u.Email,
                u.FullName,
                u.PhoneNumber,
                u.Role,
                u.RoleId,
                u.UserRole != null ? u.UserRole.Name : null,
                u.EmailVerified,
                u.LastLoginAt,
                u.CreatedAtUtc,
                u.Status
            ))
            .ToListAsync();

        return Ok(new PagedResult<UserListItemDto>(items, total, page, pageSize));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("users.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var user = await _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();
        if (!user.IsDeleted) return BadRequest("این کاربر حذف نشده است");

        user.IsDeleted = false;
        user.DeletedAtUtc = null;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("users.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var user = await _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("search")]
    [RequirePermission("users.view")]
    public async Task<ActionResult<IEnumerable<UserOptionDto>>> SearchUsers(
        [FromQuery] string? q,
        [FromQuery] bool onlyActive = true
    )
    {
        var query = _db.Users.AsNoTracking();

        if (onlyActive)
            query = query.Where(u => u.Status && !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            q = q.Trim();
            query = query.Where(u =>
                u.FullName.Contains(q) ||
                u.Email.Contains(q) ||
                u.FullName.Contains(q));
        }

        var users = await query
            .OrderBy(u => u.FullName)
            .Take(20)
            .Select(u => new UserOptionDto(u.Id, u.FullName, u.Email))
            .ToListAsync();

        return Ok(users);
    }


    [HttpGet("options")]
    [RequirePermission("users.view")]
    public async Task<ActionResult<List<UserOptionDto>>> UserOptions()
    {
        var users = await _db.Users
                .AsNoTracking()
                .Where(u => !u.IsDeleted)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Select(u => new UserOptionDto(
                    u.Id,
                    (u.FirstName + " " + u.LastName).Trim()
                ))
                .ToListAsync();

        return Ok(users);
    }
}


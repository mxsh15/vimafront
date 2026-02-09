using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Notification;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/notifications")]
[Authorize]
public class AdminNotificationsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminNotificationsController(ShopDbContext db) => _db = db;

    // GET: /api/admin/notifications?page=1&pageSize=20&q=&type=4&isRead=false&userId=
    [HttpGet]
    [RequirePermission("notifications.view")]
    public async Task<ActionResult<PagedResult<AdminNotificationListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] NotificationType? type = null,
        [FromQuery] bool? isRead = null,
        [FromQuery] Guid? userId = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 200) pageSize = 20;

        var query = _db.Notifications
            .AsNoTracking()
            .Include(n => n.User)
            .Where(n => !n.IsDeleted);

        if (type.HasValue)
            query = query.Where(n => n.Type == type.Value);

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        if (userId.HasValue)
            query = query.Where(n => n.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(n =>
                n.Title.Contains(s) ||
                n.Message.Contains(s) ||
                n.User.Email.Contains(s) ||
                (n.User.FirstName + " " + n.User.LastName).Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new AdminNotificationListItemDto(
                n.Id,
                n.UserId,
                n.User.FirstName + " " + n.User.LastName,
                n.User.Email,
                n.Title,
                n.Type,
                n.IsRead,
                n.CreatedAtUtc,
                n.ActionUrl
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminNotificationListItemDto>(items, total, page, pageSize));
    }

    // GET: /api/admin/notifications/{id}
    [HttpGet("{id:guid}")]
    [RequirePermission("notifications.view")]
    public async Task<ActionResult<AdminNotificationDetailDto>> Get(Guid id)
    {
        var n = await _db.Notifications
            .AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (n == null) return NotFound();

        return Ok(new AdminNotificationDetailDto(
            n.Id,
            n.UserId,
            n.User.FirstName + " " + n.User.LastName,
            n.User.Email,
            n.Title,
            n.Message,
            n.Type,
            n.IsRead,
            n.ReadAt,
            n.RelatedEntityType,
            n.RelatedEntityId,
            n.ActionUrl,
            n.CreatedAtUtc
        ));
    }

    // POST: /api/admin/notifications/send
    [HttpPost("send")]
    [RequirePermission("notifications.send")]
    public async Task<IActionResult> Send([FromBody] AdminSendNotificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) return BadRequest("Title is required.");
        if (string.IsNullOrWhiteSpace(dto.Message)) return BadRequest("Message is required.");
        if (string.IsNullOrWhiteSpace(dto.Target)) return BadRequest("Target is required.");

        var target = dto.Target.Trim();

        IQueryable<User> users = _db.Users.AsNoTracking().Where(u => !u.IsDeleted);

        if (target.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            // nothing
        }
        else if (target.Equals("User", StringComparison.OrdinalIgnoreCase))
        {
            if (!dto.UserId.HasValue) return BadRequest("UserId is required for Target=User.");
            users = users.Where(u => u.Id == dto.UserId.Value);
        }
        else if (target.Equals("Role", StringComparison.OrdinalIgnoreCase))
        {
            if (!dto.RoleId.HasValue) return BadRequest("RoleId is required for Target=Role.");
            users = users.Where(u => u.RoleId == dto.RoleId.Value);
        }
        else if (target.Equals("Vendor", StringComparison.OrdinalIgnoreCase))
        {
            if (!dto.VendorId.HasValue)
                return BadRequest("VendorId is required for Target=Vendor.");

            // تمام اعضای فعال فروشنده
            var memberUserIds = await _db.VendorMembers
                .AsNoTracking()
                .Where(vm =>
                    vm.VendorId == dto.VendorId.Value &&
                    !vm.IsDeleted &&
                    vm.IsActive
                )
                .Select(vm => vm.UserId)
                .Distinct()
                .ToListAsync();

            // اگر هیچ عضوی پیدا نشد، می‌تونی یا OK برگردونی یا خطا بدی
            if (memberUserIds.Count == 0)
                return Ok(new { created = 0 });

            users = users.Where(u => memberUserIds.Contains(u.Id));
        }
        else
        {
            return BadRequest("Invalid Target. Use: All | User | Role | Vendor");
        }

        var userIds = await users.Select(u => u.Id).ToListAsync();
        if (userIds.Count == 0) return Ok(new { created = 0 });

        var now = DateTime.UtcNow;

        var notifications = userIds.Select(uid => new Notification
        {
            UserId = uid,
            Title = dto.Title.Trim(),
            Message = dto.Message.Trim(),
            Type = dto.Type,
            IsRead = false,
            ReadAt = null,
            RelatedEntityType = dto.RelatedEntityType,
            RelatedEntityId = dto.RelatedEntityId,
            ActionUrl = dto.ActionUrl,
            CreatedAtUtc = now
        });

        _db.Notifications.AddRange(notifications);
        await _db.SaveChangesAsync();

        return Ok(new { created = userIds.Count });
    }

    // POST: /api/admin/notifications/{id}/mark-read
    [HttpPost("{id:guid}/mark-read")]
    [RequirePermission("notifications.update")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (n == null) return NotFound();

        if (!n.IsRead)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            n.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    // POST: /api/admin/notifications/{id}/mark-unread
    [HttpPost("{id:guid}/mark-unread")]
    [RequirePermission("notifications.update")]
    public async Task<IActionResult> MarkUnread(Guid id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (n == null) return NotFound();

        if (n.IsRead)
        {
            n.IsRead = false;
            n.ReadAt = null;
            n.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    // DELETE: /api/admin/notifications/{id} (soft delete)
    [HttpDelete("{id:guid}")]
    [RequirePermission("notifications.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id);
        if (n == null) return NotFound();

        n.IsDeleted = true;
        n.DeletedAtUtc = DateTime.UtcNow;
        n.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

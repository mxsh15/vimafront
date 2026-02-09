using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.AuditLogs;
using ShopVima.Application.Utils;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize]
public class AdminAuditLogsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminAuditLogsController(ShopDbContext db) => _db = db;


    [HttpGet]
    [RequirePermission("auditLogs.view")]
    public async Task<ActionResult<PagedResult<AdminAuditLogListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] int? status = null,
        [FromQuery] string? method = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 200) pageSize = 20;

        var query = _db.AuditLogs.AsNoTracking().Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Path.Contains(s) ||
                (x.UserEmail != null && x.UserEmail.Contains(s)) ||
                (x.Action != null && x.Action.Contains(s)) ||
                (x.EntityType != null && x.EntityType.Contains(s)));
        }

        if (status.HasValue) query = query.Where(x => x.StatusCode == status.Value);

        if (!string.IsNullOrWhiteSpace(method))
        {
            var m = method.Trim().ToUpperInvariant();
            query = query.Where(x => x.Method == m);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AdminAuditLogListItemDto(
                x.Id,
                x.CreatedAtUtc,
                x.UserId,
                x.UserEmail,
                x.Method,
                x.Path,
                x.StatusCode,
                x.DurationMs
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminAuditLogListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("auditLogs.view")]
    public async Task<ActionResult<AdminAuditLogDetailDto>> Get(Guid id)
    {
        var x = await _db.AuditLogs.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        if (x == null) return NotFound();

        return Ok(new AdminAuditLogDetailDto(
            x.Id,
            x.CreatedAtUtc,
            x.UserId,
            x.UserEmail,
            x.Method,
            x.Path,
            x.QueryString,
            x.StatusCode,
            x.DurationMs,
            x.IpAddress,
            x.UserAgent,
            x.EntityType,
            x.EntityId,
            x.Action,
            x.Notes
        ));
    }
}

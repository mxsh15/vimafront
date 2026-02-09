using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Returns;
using ShopVima.Application.Utils;
using ShopVima.Domain.Enums;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/returns")]
[Authorize]
public class AdminReturnsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public AdminReturnsController(ShopDbContext db) => _db = db;


    [HttpGet]
    [RequirePermission("returns.view")]
    public async Task<ActionResult<PagedResult<AdminReturnListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] ReturnStatus? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.ReturnRequests
            .AsNoTracking()
            .Include(r => r.Order).ThenInclude(o => o.User)
            .Include(r => r.OrderItem)
            .Where(r => !r.IsDeleted);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r =>
                r.Reason.Contains(s) ||
                (r.Description != null && r.Description.Contains(s)) ||
                r.Order.Id.ToString().Contains(s) ||
                r.Order.User.Email.Contains(s) ||
                (r.Order.User.FirstName + " " + r.Order.User.LastName).Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReturnListItemDto(
                r.Id,
                r.OrderId,
                r.OrderItemId,
                r.Order.OrderNumber,
                r.Order.User.FirstName + " " + r.Order.User.LastName,
                r.Order.User.Email,
                r.Reason,
                r.Status,
                r.RequestedAt,
                r.CreatedAtUtc,
                r.UpdatedAtUtc,
                r.IsDeleted,
                r.DeletedAtUtc,
                Convert.ToBase64String(r.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminReturnListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("abandoned")]
    [RequirePermission("returns.view")]
    public async Task<ActionResult<PagedResult<AdminReturnListItemDto>>> Abandoned(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int days = 7,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var cutoff = DateTime.UtcNow.AddDays(-Math.Max(1, days));

        var query = _db.ReturnRequests
            .AsNoTracking()
            .Include(r => r.Order).ThenInclude(o => o.User)
            .Include(r => r.OrderItem)
            .Where(r => !r.IsDeleted)
            .Where(r => r.Status == ReturnStatus.Pending && r.RequestedAt <= cutoff);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r =>
                r.Reason.Contains(s) ||
                r.Order.User.Email.Contains(s) ||
                (r.Order.User.FirstName + " " + r.Order.User.LastName).Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReturnListItemDto(
                r.Id,
                r.OrderId,
                r.OrderItemId,
                r.Order.OrderNumber,
                r.Order.User.FirstName + " " + r.Order.User.LastName,
                r.Order.User.Email,
                r.Reason,
                r.Status,
                r.RequestedAt,
                r.CreatedAtUtc,
                r.UpdatedAtUtc,
                r.IsDeleted,
                r.DeletedAtUtc,
                Convert.ToBase64String(r.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminReturnListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("returns.view")]
    public async Task<ActionResult<AdminReturnDetailDto>> Get(Guid id)
    {
        var r = await _db.ReturnRequests
            .AsNoTracking()
            .Include(x => x.Order).ThenInclude(o => o.User)
            .Include(x => x.Refund)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return NotFound();

        AdminRefundDto? refund = null;
        if (r.Refund != null)
        {
            refund = new AdminRefundDto(
                r.Refund.Id,
                r.Refund.PaymentId,
                r.Refund.Amount,
                r.Refund.Status,
                r.Refund.TransactionId,
                r.Refund.FailureReason,
                r.Refund.CreatedAt,
                r.Refund.ProcessedAt
            );
        }

        return Ok(new AdminReturnDetailDto(
            r.Id,
            r.OrderId,
            r.OrderItemId,
            r.Order.OrderNumber,
            r.Order.User.FirstName + " " + r.Order.User.LastName,
            r.Order.User.Email,
            r.Reason,
            r.Description,
            r.Status,
            r.AdminNotes,
            r.ReviewedBy,
            r.RequestedAt,
            r.ApprovedAt,
            r.CompletedAt,
            refund,
            r.CreatedAtUtc,
            r.UpdatedAtUtc,
            r.IsDeleted,
            r.DeletedAtUtc,
            Convert.ToBase64String(r.RowVersion)
        ));
    }


    [HttpPost("{id:guid}/review")]
    [RequirePermission("returns.review")]
    public async Task<IActionResult> Review(Guid id, [FromBody] AdminReturnReviewDto dto)
    {
        var r = await _db.ReturnRequests.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (r == null) return NotFound();

        if (r.Status != ReturnStatus.Pending)
            return BadRequest("این درخواست در وضعیت Pending نیست.");

        r.AdminNotes = dto.AdminNotes;
        r.ReviewedBy = null; // اگر UserId ادمین را از Claims می‌گیری، اینجا ست کن
        r.UpdatedAtUtc = DateTime.UtcNow;

        if (dto.Approve)
        {
            r.Status = ReturnStatus.Approved;
            r.ApprovedAt = DateTime.UtcNow;
        }
        else
        {
            r.Status = ReturnStatus.Rejected;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("{id:guid}/complete")]
    [RequirePermission("returns.complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] string? adminNotes)
    {
        var r = await _db.ReturnRequests.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (r == null) return NotFound();

        if (r.Status != ReturnStatus.Approved)
            return BadRequest("فقط درخواست تایید شده قابل تکمیل است.");

        r.Status = ReturnStatus.Completed;
        r.CompletedAt = DateTime.UtcNow;
        r.AdminNotes = adminNotes ?? r.AdminNotes;
        r.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("{id:guid}/refund")]
    [RequirePermission("refunds.create")]
    public async Task<IActionResult> CreateRefund(Guid id, [FromBody] AdminCreateRefundDto dto)
    {
        var r = await _db.ReturnRequests
            .Include(x => x.Refund)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (r == null) return NotFound();
        if (r.Refund != null) return BadRequest("برای این درخواست قبلاً Refund ثبت شده است.");

        // پرداخت باید وجود داشته باشد
        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.Id == dto.PaymentId);
        if (payment == null) return BadRequest("PaymentId معتبر نیست.");

        var refund = new Refund
        {
            ReturnRequestId = r.Id,
            PaymentId = dto.PaymentId,
            Amount = dto.Amount,
            Status = RefundStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Refunds.Add(refund);
        r.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}")]
    [RequirePermission("returns.delete")]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        var r = await _db.ReturnRequests.FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();

        r.IsDeleted = true;
        r.DeletedAtUtc = DateTime.UtcNow;
        r.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpGet("trash")]
    [RequirePermission("returns.trash.view")]
    public async Task<ActionResult<PagedResult<AdminReturnListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.ReturnRequests
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(r => r.Order).ThenInclude(o => o.User)
            .Where(r => r.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r => r.Reason.Contains(s) || r.Order.User.Email.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.DeletedAtUtc ?? r.UpdatedAtUtc ?? r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReturnListItemDto(
                r.Id,
                r.OrderId,
                r.OrderItemId,
                r.Order.OrderNumber,
                r.Order.User.FirstName + " " + r.Order.User.LastName,
                r.Order.User.Email,
                r.Reason,
                r.Status,
                r.RequestedAt,
                r.CreatedAtUtc,
                r.UpdatedAtUtc,
                r.IsDeleted,
                r.DeletedAtUtc,
                Convert.ToBase64String(r.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminReturnListItemDto>(items, total, page, pageSize));
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("returns.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var r = await _db.ReturnRequests.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (r == null) return NotFound();
        if (!r.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        r.IsDeleted = false;
        r.DeletedAtUtc = null;
        r.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("returns.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var r = await _db.ReturnRequests
            .IgnoreQueryFilters()
            .Include(x => x.Refund)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return NotFound();

        if (r.Refund != null)
            _db.Refunds.Remove(r.Refund);

        _db.ReturnRequests.Remove(r);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

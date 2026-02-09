using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Order;
using ShopVima.Application.Dtos.Payment;
using ShopVima.Application.Services;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPermissionService _permissionService;
    private readonly IConfiguration _config;

    public PaymentsController(ShopDbContext db, IPermissionService permissionService, IConfiguration config)
    {
        _db = db;
        _permissionService = permissionService;
        _config = config;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(id) || !Guid.TryParse(id, out var userId))
            throw new UnauthorizedAccessException("Invalid user id claim.");
        return userId;
    }

    private static PaymentStatus? TryParsePaymentStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return null;

        if (int.TryParse(status, out var si) && Enum.IsDefined(typeof(PaymentStatus), si))
            return (PaymentStatus)si;

        if (Enum.TryParse<PaymentStatus>(status, true, out var st))
            return st;

        return null;
    }


    [HttpGet]
    [RequirePermission("payments.view")]
    public async Task<ActionResult<PagedResult<PaymentListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Payments
            .AsNoTracking()
            .Include(p => p.Order)
                .ThenInclude(o => o.User)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p =>
                p.TransactionId.Contains(s) ||
                (p.ReferenceNumber != null && p.ReferenceNumber.Contains(s)) ||
                p.Order.OrderNumber.Contains(s) ||
                p.Order.User.FullName.Contains(s) ||
                p.Order.User.Email.Contains(s)
            );
        }

        var st = TryParsePaymentStatus(status);
        if (st.HasValue)
            query = query.Where(p => p.Status == st.Value);

        var total = await query.LongCountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PaymentListItemDto
            {
                Id = p.Id,
                OrderId = p.OrderId,
                OrderNumber = p.Order.OrderNumber,
                UserId = p.Order.UserId,
                CustomerName = p.Order.User.FullName,

                TransactionId = p.TransactionId,
                ReferenceNumber = p.ReferenceNumber,
                Method = p.Method,
                Status = p.Status,
                Amount = p.Amount,
                GatewayName = p.GatewayName,
                PaidAt = p.PaidAt,
                CreatedAtUtc = p.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new PagedResult<PaymentListItemDto>(items, (int)total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentDto>> GetPayment(Guid id)
    {
        var userId = GetUserId();
        var canViewAll = await _permissionService.HasPermissionAsync(userId, "payments.view");

        var payment = await _db.Payments
            .AsNoTracking()
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p =>
                p.Id == id &&
                !p.IsDeleted &&
                (canViewAll || p.Order.UserId == userId)
            );

        if (payment == null) return NotFound();

        return Ok(new PaymentDto
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            TransactionId = payment.TransactionId,
            ReferenceNumber = payment.ReferenceNumber,
            Method = payment.Method,
            Status = payment.Status,
            Amount = payment.Amount,
            GatewayName = payment.GatewayName,
            PaidAt = payment.PaidAt,
            FailureReason = payment.FailureReason
        });
    }

    [HttpPost("initiate")]
    public async Task<ActionResult<PaymentInitiateResultDto>> Initiate([FromBody] PaymentInitiateDto dto)
    {
        var userId = GetUserId();

        var order = await _db.Orders
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId && !o.IsDeleted);

        if (order == null) return NotFound("Order not found");

        if (order.Status != OrderStatus.Pending)
            return BadRequest("Order is not in pending status");

        // جلوگیری از پرداخت موفق تکراری
        if (order.Payments.Any(p => p.Status == PaymentStatus.Completed))
            return BadRequest("Order already has a completed payment.");

        var txn = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..30].ToUpper();

        var payment = new Payment
        {
            OrderId = order.Id,
            TransactionId = txn,
            Method = dto.Method,
            Status = PaymentStatus.Pending,
            Amount = order.TotalAmount,
            GatewayName = _config["Payments:DefaultGateway"] ?? "DefaultGateway",
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        return Ok(new PaymentInitiateResultDto
        {
            TransactionId = payment.TransactionId,
            PaymentUrl = $"/payment/{payment.TransactionId}", // TODO: درگاه واقعی
            PaymentId = payment.Id,
            OrderId = payment.OrderId
        });
    }

    [HttpPost("verify")]
    [Authorize]
    public async Task<ActionResult<PaymentVerifyResultDto>> Verify([FromBody] PaymentVerifyDto dto)
    {
        var uid = GetUserId();

        var payment = await _db.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.TransactionId == dto.TransactionId && !p.IsDeleted);

        if (payment == null) return NotFound("Payment not found");

        var canManage = await _permissionService.HasPermissionAsync(uid, "payments.manage");
        var isOwner = payment.Order.UserId == uid;

        if (!canManage && !isOwner)
            return Forbid();


        if (payment.Status == PaymentStatus.Completed)
        {
            return Ok(new PaymentVerifyResultDto
            {
                Success = true,
                OrderId = payment.OrderId,
                PaymentId = payment.Id,
                Status = payment.Status
            });
        }

        if (dto.Success)
        {
            payment.Status = PaymentStatus.Completed;
            payment.ReferenceNumber = dto.ReferenceNumber;
            payment.PaidAt = DateTime.UtcNow;
            payment.FailureReason = null;
            payment.UpdatedAtUtc = DateTime.UtcNow;

            payment.Order.Status = OrderStatus.Processing;
            payment.Order.UpdatedAtUtc = DateTime.UtcNow;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
            payment.FailureReason = string.IsNullOrWhiteSpace(dto.FailureReason)
                ? "Payment failed"
                : dto.FailureReason;
            payment.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new PaymentVerifyResultDto
        {
            Success = dto.Success,
            OrderId = payment.OrderId,
            PaymentId = payment.Id,
            Status = payment.Status
        });
    }

}
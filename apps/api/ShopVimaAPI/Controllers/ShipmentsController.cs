using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Shipping;
using ShopVima.Application.Services;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/shipments")]
[Authorize]
public class ShipmentsController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPermissionService _permissionService;

    public ShipmentsController(ShopDbContext db, IPermissionService permissionService)
    {
        _db = db;
        _permissionService = permissionService;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(id) || !Guid.TryParse(id, out var userId))
            throw new UnauthorizedAccessException("Invalid user id claim.");
        return userId;
    }

    private static ShippingStatus? TryParseShippingStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return null;

        if (int.TryParse(status, out var si) && Enum.IsDefined(typeof(ShippingStatus), si))
            return (ShippingStatus)si;

        if (Enum.TryParse<ShippingStatus>(status, true, out var st))
            return st;

        return null;
    }

    private static void ApplyUpsert(Shipping s, ShippingUpsertDto dto)
    {
        s.Status = dto.Status;
        s.TrackingNumber = string.IsNullOrWhiteSpace(dto.TrackingNumber) ? null : dto.TrackingNumber.Trim();
        s.ShippingCompany = string.IsNullOrWhiteSpace(dto.ShippingCompany) ? null : dto.ShippingCompany.Trim();
        s.ShippingMethod = string.IsNullOrWhiteSpace(dto.ShippingMethod) ? null : dto.ShippingMethod.Trim();
        s.ShippedAt = dto.ShippedAt;
        s.DeliveredAt = dto.DeliveredAt;
        s.EstimatedDeliveryDate = dto.EstimatedDeliveryDate;
        s.UpdatedAtUtc = DateTime.UtcNow;
    }

    [HttpGet]
    [RequirePermission("shipments.view")]
    public async Task<ActionResult<PagedResult<ShippingListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Shippings
            .AsNoTracking()
            .Include(s => s.Order)
                .ThenInclude(o => o.User)
            .Include(s => s.Order)
                .ThenInclude(o => o.ShippingAddress)
            .Where(s => !s.IsDeleted && !s.Order.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                (x.TrackingNumber != null && x.TrackingNumber.Contains(s)) ||
                x.Order.OrderNumber.Contains(s) ||
                x.Order.User.FullName.Contains(s) ||
                x.Order.User.Email.Contains(s)
            );
        }

        var st = TryParseShippingStatus(status);
        if (st.HasValue)
            query = query.Where(x => x.Status == st.Value);

        var total = await query.LongCountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ShippingListItemDto(
                x.Id,
                x.OrderId,
                x.Order.OrderNumber,
                x.Order.UserId,
                x.Order.User.FullName,
                x.Order.ShippingAddress != null ? x.Order.ShippingAddress.Province : "-",
                x.Order.ShippingAddress != null ? x.Order.ShippingAddress.City : "-",
                x.Status,
                x.TrackingNumber,
                x.ShippingCompany,
                x.ShippingMethod,
                x.ShippedAt,
                x.DeliveredAt,
                x.EstimatedDeliveryDate,
                x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ShippingListItemDto>(items, (int)total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShippingDto>> Get(Guid id)
    {
        var userId = GetUserId();
        var canViewAll = await _permissionService.HasPermissionAsync(userId, "shipments.view");

        var shipping = await _db.Shippings
            .AsNoTracking()
            .Include(s => s.Order)
            .FirstOrDefaultAsync(s =>
                s.Id == id &&
                !s.IsDeleted &&
                !s.Order.IsDeleted &&
                (canViewAll || s.Order.UserId == userId)
            );

        if (shipping == null) return NotFound();

        return Ok(new ShippingDto(
            shipping.Id,
            shipping.OrderId,
            shipping.Status,
            shipping.TrackingNumber,
            shipping.ShippingCompany,
            shipping.ShippingMethod,
            shipping.ShippedAt,
            shipping.DeliveredAt,
            shipping.EstimatedDeliveryDate,
            shipping.CreatedAtUtc
        ));
    }


    [HttpPut("by-order/{orderId:guid}")]
    [RequirePermission("shipments.manage")]
    public async Task<ActionResult<ShippingDto>> UpsertByOrder(Guid orderId, [FromBody] ShippingUpsertDto dto)
    {
        var order = await _db.Orders
            .Include(o => o.Shipping)
            .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);

        if (order == null) return NotFound("Order not found");

        if (order.Shipping == null)
        {
            order.Shipping = new Shipping
            {
                OrderId = order.Id,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.Shippings.Add(order.Shipping);
        }

        ApplyUpsert(order.Shipping, dto);

        if (dto.ShippedAt.HasValue && order.ShippedAt == null)
            order.ShippedAt = dto.ShippedAt;

        if (dto.DeliveredAt.HasValue && order.DeliveredAt == null)
            order.DeliveredAt = dto.DeliveredAt;

        order.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var s = order.Shipping;
        return Ok(new ShippingDto(
            s.Id,
            s.OrderId,
            s.Status,
            s.TrackingNumber,
            s.ShippingCompany,
            s.ShippingMethod,
            s.ShippedAt,
            s.DeliveredAt,
            s.EstimatedDeliveryDate,
            s.CreatedAtUtc
        ));
    }


}

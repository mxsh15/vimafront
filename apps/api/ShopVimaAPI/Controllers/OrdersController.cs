using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Order;
using ShopVima.Application.Dtos.Payment;
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
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPermissionService _permissionService;

    public OrdersController(ShopDbContext db, IPermissionService permissionService)
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
    private static OrderStatus? TryParseOrderStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return null;

        if (int.TryParse(status, out var si) && Enum.IsDefined(typeof(OrderStatus), si))
            return (OrderStatus)si;

        if (Enum.TryParse<OrderStatus>(status, true, out var st))
            return st;

        return null;
    }

    [HttpGet]
    [RequirePermission("orders.view")]
    public async Task<ActionResult<PagedResult<OrderListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] Guid? vendorId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] decimal? minTotal = null,
        [FromQuery] decimal? maxTotal = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Where(o => !o.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(o =>
                o.OrderNumber.Contains(s) ||
                o.User.FullName.Contains(s) ||
                o.User.Email.Contains(s)
            );
        }

        var st = TryParseOrderStatus(status);
        if (st.HasValue)
            query = query.Where(o => o.Status == st.Value);

        if (userId.HasValue)
            query = query.Where(o => o.UserId == userId.Value);

        if (vendorId.HasValue)
        {
            query = query.Where(o =>
                o.Items.Any(i => i.VendorOffer != null && i.VendorOffer.VendorId == vendorId.Value)
            );
        }

        if (from.HasValue)
            query = query.Where(o => o.CreatedAtUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(o => o.CreatedAtUtc <= to.Value);

        if (minTotal.HasValue)
            query = query.Where(o => o.TotalAmount >= minTotal.Value);

        if (maxTotal.HasValue)
            query = query.Where(o => o.TotalAmount <= maxTotal.Value);

        var total = await query.LongCountAsync();

        var items = await query
            .OrderByDescending(o => o.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItemDto(
                o.Id,
                o.OrderNumber,
                o.User.FullName,
                o.Status,
                o.TotalAmount,
                o.Items.Count,
                o.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<OrderListItemDto>(items, (int)total, page, pageSize));
    }


    [HttpGet("my-orders")]
    public async Task<ActionResult<List<OrderListItemDto>>> GetMyOrders()
    {
        var userId = GetUserId();

        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new OrderListItemDto(
                o.Id,
                o.OrderNumber,
                o.User.FullName,
                o.Status,
                o.TotalAmount,
                o.Items.Count,
                o.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(orders);
    }


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> Get(Guid id)
    {
        var userId = GetUserId();
        var canViewAll = await _permissionService.HasPermissionAsync(userId, "orders.view");

        var order = await _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.Items)
                .ThenInclude(i => i.VendorOffer)
                    .ThenInclude(vo => vo.Vendor)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Payments)
            .Include(o => o.Shipping)
            .FirstOrDefaultAsync(o =>
                o.Id == id &&
                !o.IsDeleted &&
                (canViewAll || o.UserId == userId)
            );

        if (order == null) return NotFound();

        var items = order.Items.Select(i => new OrderItemDto(
            i.Id,
            i.VendorOffer?.VendorId ?? Guid.Empty,
            i.VendorOffer?.Vendor?.StoreName ?? "-",
            i.ProductId,
            i.ProductTitle,
            i.VariantName,
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice,
            i.CommissionAmount
        )).ToList();

        var shippingAddress = order.ShippingAddress != null
            ? new ShippingAddressDto(
                order.ShippingAddress.Id,
                order.ShippingAddress.Title,
                order.ShippingAddress.Province,
                order.ShippingAddress.City,
                order.ShippingAddress.AddressLine,
                order.ShippingAddress.PostalCode
            )
            : null;

        var payment = order.Payments
            .OrderByDescending(p => p.CreatedAtUtc)
            .FirstOrDefault();

        var paymentDto = payment is null
            ? null
            : new PaymentDto
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
            };

        var shippingDto = order.Shipping != null
            ? new ShopVima.Application.Dtos.Order.ShippingDto(
                order.Shipping.Id,
                order.Shipping.Status,
                order.Shipping.TrackingNumber,
                order.Shipping.ShippingCompany,
                order.Shipping.ShippingMethod,
                order.Shipping.ShippedAt,
                order.Shipping.DeliveredAt,
                order.Shipping.EstimatedDeliveryDate
            )
            : null;

        return Ok(new OrderDto(
            order.Id,
            order.OrderNumber,
            order.UserId,
            order.User.FullName,
            order.ShippingAddressId,
            order.Status,
            order.SubTotal,
            order.ShippingCost,
            order.DiscountAmount,
            order.TaxAmount,
            order.TotalAmount,
            order.Notes,
            order.ShippedAt,
            order.DeliveredAt,
            order.CreatedAtUtc,
            items,
            shippingAddress,
            paymentDto,
            shippingDto
        ));
    }


    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] OrderCreateDto dto)
    {
        var userId = GetUserId();

        // بررسی مالکیت آدرس ارسال
        var shippingAddress = await _db.ShippingAddresses
            .FirstOrDefaultAsync(a => a.Id == dto.ShippingAddressId && a.UserId == userId && !a.IsDeleted);

        if (shippingAddress == null)
            return BadRequest("Invalid shipping address.");

        // جمع‌آوری آیتم‌ها
        var requestedItems = (dto.Items ?? new List<OrderItemCreateDto>())
            .Where(x => x.Quantity > 0)
            .ToList();

        // اگر آیتم‌ها نیامده، از Cart می‌خوانیم
        List<(Guid ProductId, Guid VendorOfferId, Guid? VariantId, int Qty)> itemsToCreate = new();

        Cart? cart = null;
        if (requestedItems.Count == 0)
        {
            cart = await _db.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .Include(c => c.Items)
                    .ThenInclude(i => i.VendorOffer)
                        .ThenInclude(vo => vo!.Vendor)
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

            if (cart == null || !cart.Items.Any())
                return BadRequest("Cart is empty.");

            foreach (var ci in cart.Items)
            {
                if (!ci.VendorOfferId.HasValue)
                    return BadRequest("Cart item has no vendor offer.");

                itemsToCreate.Add((ci.ProductId, ci.VendorOfferId.Value, ci.ProductVariantId, ci.Quantity));
            }
        }
        else
        {
            foreach (var it in requestedItems)
                itemsToCreate.Add((it.ProductId, it.VendorOfferId, it.ProductVariantId, it.Quantity));
        }

        // لود Offer ها + Product
        var offerIds = itemsToCreate.Select(x => x.VendorOfferId).Distinct().ToList();

        var offers = await _db.VendorOffers
            .Include(o => o.Product)
            .Include(o => o.Vendor)
            .Where(o => offerIds.Contains(o.Id))
            .ToListAsync();

        if (offers.Count != offerIds.Count)
            return BadRequest("One or more vendor offers are invalid.");

        // ساخت سفارش
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..22].ToUpper();

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            ShippingAddressId = dto.ShippingAddressId,
            Status = OrderStatus.Pending,
            Notes = dto.Notes,
            CreatedAtUtc = DateTime.UtcNow
        };

        decimal subTotal = 0;

        foreach (var line in itemsToCreate)
        {
            var offer = offers.First(o => o.Id == line.VendorOfferId);

            // sanity
            if (offer.ProductId != line.ProductId)
                return BadRequest("VendorOffer does not belong to the specified product.");

            if (offer.Status != VendorOfferStatus.Approved)
                return BadRequest("VendorOffer is not approved.");

            // قیمت لحظه سفارش
            var unitPrice = offer.DiscountPrice ?? offer.Price;

            // موجودی (اگر فروشنده مدیریت موجودی دارد)
            if (offer.ManageStock)
            {
                if (offer.StockQuantity < line.Qty && offer.BackorderPolicy == BackorderPolicy.DoNotAllow)
                    return BadRequest("Insufficient stock for one of the items.");

                offer.StockQuantity -= line.Qty;
                if (offer.StockQuantity <= 0 && offer.BackorderPolicy == BackorderPolicy.DoNotAllow)
                    offer.StockStatus = StockStatus.OutOfStock;
            }

            var totalPrice = unitPrice * line.Qty;

            order.Items.Add(new OrderItem
            {
                ProductId = line.ProductId,
                VendorOfferId = offer.Id,
                ProductVariantId = line.VariantId,
                ProductTitle = offer.Product.Title,
                VariantName = null, // اگر خواستی بعداً از AttributeValues بسازیم
                Quantity = line.Qty,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice,
                CreatedAtUtc = DateTime.UtcNow
            });

            subTotal += totalPrice;
        }

        order.SubTotal = subTotal;
        order.ShippingCost = 0;     // TODO: محاسبه ارسال
        order.DiscountAmount = 0;   // TODO: اعمال کوپن (dto.CouponId)
        order.TaxAmount = 0;        // TODO: مالیات
        order.TotalAmount = order.SubTotal + order.ShippingCost - order.DiscountAmount + order.TaxAmount;

        _db.Orders.Add(order);

        // اگر از cart ساخته شد، cart را خالی کن
        if (cart != null)
            _db.CartItems.RemoveRange(cart.Items);

        await _db.SaveChangesAsync();

        // خروجی: از Get استفاده می‌کنیم تا DTO کامل برگردد
        return await Get(order.Id);
    }


    [HttpPatch("{id:guid}/status")]
    [RequirePermission("orders.update")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatusUpdateDto dto)
    {
        var order = await _db.Orders
            .Include(o => o.Shipping)
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

        if (order == null) return NotFound();

        order.Status = dto.Status;
        order.UpdatedAtUtc = DateTime.UtcNow;

        // timestamps on Order
        if (dto.Status == OrderStatus.Shipped && order.ShippedAt == null)
            order.ShippedAt = DateTime.UtcNow;

        if (dto.Status == OrderStatus.Delivered && order.DeliveredAt == null)
            order.DeliveredAt = DateTime.UtcNow;

        // best-effort sync Shipping
        if (order.Shipping != null)
        {
            if (dto.Status == OrderStatus.Shipped && order.Shipping.ShippedAt == null)
            {
                order.Shipping.Status = ShippingStatus.Shipped;
                order.Shipping.ShippedAt = DateTime.UtcNow;
                order.Shipping.UpdatedAtUtc = DateTime.UtcNow;
            }

            if (dto.Status == OrderStatus.Delivered && order.Shipping.DeliveredAt == null)
            {
                order.Shipping.Status = ShippingStatus.Delivered;
                order.Shipping.DeliveredAt = DateTime.UtcNow;
                order.Shipping.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPut("{id:guid}/shipping")]
    [RequirePermission("orders.update")]
    public async Task<ActionResult<ShopVima.Application.Dtos.Order.ShippingDto>> UpsertShipping(Guid id, [FromBody] ShippingUpsertDto dto)
    {
        var order = await _db.Orders
            .Include(o => o.Shipping)
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

        if (order == null) return NotFound();

        if (order.Shipping == null)
        {
            order.Shipping = new Shipping
            {
                OrderId = order.Id,
                CreatedAtUtc = DateTime.UtcNow
            };
            _db.Shippings.Add(order.Shipping);
        }

        order.Shipping.Status = dto.Status;
        order.Shipping.TrackingNumber = string.IsNullOrWhiteSpace(dto.TrackingNumber) ? null : dto.TrackingNumber.Trim();
        order.Shipping.ShippingCompany = string.IsNullOrWhiteSpace(dto.ShippingCompany) ? null : dto.ShippingCompany.Trim();
        order.Shipping.ShippingMethod = string.IsNullOrWhiteSpace(dto.ShippingMethod) ? null : dto.ShippingMethod.Trim();
        order.Shipping.ShippedAt = dto.ShippedAt;
        order.Shipping.DeliveredAt = dto.DeliveredAt;
        order.Shipping.EstimatedDeliveryDate = dto.EstimatedDeliveryDate;
        order.Shipping.UpdatedAtUtc = DateTime.UtcNow;

        // sync timestamps to Order if empty
        if (dto.ShippedAt.HasValue && order.ShippedAt == null)
            order.ShippedAt = dto.ShippedAt;

        if (dto.DeliveredAt.HasValue && order.DeliveredAt == null)
            order.DeliveredAt = dto.DeliveredAt;

        order.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new ShopVima.Application.Dtos.Order.ShippingDto(
            order.Shipping.Id,
            order.Shipping.Status,
            order.Shipping.TrackingNumber,
            order.Shipping.ShippingCompany,
            order.Shipping.ShippingMethod,
            order.Shipping.ShippedAt,
            order.Shipping.DeliveredAt,
            order.Shipping.EstimatedDeliveryDate
        ));
    }
}

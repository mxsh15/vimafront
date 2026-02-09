namespace ShopVima.Application.Dtos.Order;

public record OrderCreateDto(
    Guid ShippingAddressId,
    Guid? CouponId,
    string? Notes,
    List<OrderItemCreateDto> Items
);

public record OrderItemCreateDto(
    Guid ProductId,
    Guid VendorOfferId,
    Guid? ProductVariantId,
    int Quantity
);


namespace ShopVima.Application.Dtos.Order;

public record OrderItemDto(
    Guid Id,
    Guid VendorId,
    string VendorStoreName,
    Guid ProductId,
    string ProductTitle,
    string? VariantName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    decimal? CommissionAmount
);


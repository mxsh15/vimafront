namespace ShopVima.Application.Dtos.Cart;

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    string? ProductImageUrl,
    Guid? VendorOfferId,
    Guid? ProductVariantId,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);


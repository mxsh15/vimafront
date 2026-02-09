namespace ShopVima.Application.Dtos.Cart;

public record AddToCartDto(
    Guid ProductId,
    Guid VendorOfferId,
    Guid? ProductVariantId,
    int Quantity
);


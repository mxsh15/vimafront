namespace ShopVima.Application.Dtos.Wishlist;

public record WishlistItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    string? ProductImageUrl,
    Guid? VendorOfferId,
    decimal? Price
);


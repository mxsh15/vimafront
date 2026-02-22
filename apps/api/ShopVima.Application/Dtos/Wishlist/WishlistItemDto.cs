namespace ShopVima.Application.Dtos.Wishlist;

public record WishlistItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    string ProductSlug,
    string? ProductImageUrl,
    Guid? VendorOfferId,
    decimal? Price
);


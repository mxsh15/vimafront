namespace ShopVima.Application.Dtos.Wishlist;

public record ToggleWishlistDto(
    Guid ProductId,
    Guid? VendorOfferId
);

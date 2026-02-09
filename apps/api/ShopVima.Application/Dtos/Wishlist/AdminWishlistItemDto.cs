namespace ShopVima.Application.Dtos.Wishlist;

public record AdminWishlistItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    Guid? VendorOfferId,
    string? VendorName,
    DateTime CreatedAtUtc
);

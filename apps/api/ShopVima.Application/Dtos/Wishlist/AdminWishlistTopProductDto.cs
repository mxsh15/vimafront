namespace ShopVima.Application.Dtos.Wishlist;

public record AdminWishlistTopProductDto(
    Guid ProductId,
    string ProductTitle,
    int WishCount
);
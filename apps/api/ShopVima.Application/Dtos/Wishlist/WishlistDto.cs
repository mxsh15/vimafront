using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Wishlist;

public record WishlistDto(
    Guid Id,
    Guid UserId,
    string? Name,
    bool IsDefault,
    List<WishlistItemDto> Items,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


using ShopVima.Application.Dtos.Common;


namespace ShopVima.Application.Dtos.Wishlist;

public record AdminWishlistListItemDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string? Name,
    bool IsDefault,
    int ItemsCount,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

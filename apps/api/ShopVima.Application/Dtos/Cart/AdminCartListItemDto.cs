using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Cart;

public record AdminCartListItemDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    int TotalItems,
    decimal TotalPrice,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

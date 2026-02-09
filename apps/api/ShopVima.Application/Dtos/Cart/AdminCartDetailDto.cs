using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Cart;

public record AdminCartDetailDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string? UserPhone,
    List<CartItemDto> Items,
    decimal TotalPrice,
    int TotalItems,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);
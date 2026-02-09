using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Cart;

public record CartDto(
    Guid Id,
    Guid UserId,
    List<CartItemDto> Items,
    decimal TotalPrice,
    int TotalItems,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


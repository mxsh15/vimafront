using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Discount;

public record DiscountDto(
    Guid Id,
    string Title,
    string? Description,
    DiscountType Type,
    decimal Value,
    Guid? ProductId,
    Guid? CategoryId,
    Guid? VendorId,
    Guid? BrandId,
    decimal? MinPurchaseAmount,
    decimal? MaxDiscountAmount,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    bool IsActive,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);
using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Coupon;

public record CouponDto(
    Guid Id,
    string Code,
    string Title,
    string? Description,
    CouponType Type,
    decimal Value,
    decimal? MinPurchaseAmount,
    decimal? MaxDiscountAmount,
    int? MaxUsageCount,
    int UsedCount,
    int? MaxUsagePerUser,
    DateTime? ValidFrom,
    DateTime? ValidTo,
    bool IsActive,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


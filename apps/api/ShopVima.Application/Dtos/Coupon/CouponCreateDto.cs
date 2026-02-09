using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Coupon;

public record CouponCreateDto(
    string Code,
    string Title,
    string? Description,
    CouponType Type,
    decimal Value,
    decimal? MinPurchaseAmount,
    decimal? MaxDiscountAmount,
    int? MaxUsageCount,
    int? MaxUsagePerUser,
    DateTime? ValidFrom,
    DateTime? ValidTo
);


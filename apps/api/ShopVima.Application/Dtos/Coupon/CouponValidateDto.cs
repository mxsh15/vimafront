namespace ShopVima.Application.Dtos.Coupon;

public record CouponValidateDto(
    string Code,
    decimal CartTotal
);

public record CouponValidationResultDto(
    bool IsValid,
    string? ErrorMessage,
    decimal DiscountAmount,
    CouponDto? Coupon
);


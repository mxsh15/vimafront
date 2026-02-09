using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Discount;

public record DiscountCreateDto(
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
    bool IsActive
);
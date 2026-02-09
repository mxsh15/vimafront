using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorOffer;

public record AdminVendorOfferListItemDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    Guid VendorId,
    string VendorName,
    decimal Price,
    decimal? DiscountPrice,
    bool IsDefaultForProduct,
    VendorOfferStatus Status,
    bool IsDeleted,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    DateTime? DeletedAtUtc,
    string RowVersion
);

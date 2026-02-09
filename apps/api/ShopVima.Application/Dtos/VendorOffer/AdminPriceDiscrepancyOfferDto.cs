using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorOffer;

public record AdminPriceDiscrepancyOfferDto(
    Guid OfferId,
    Guid VendorId,
    string VendorName,
    decimal Price,
    decimal? DiscountPrice,
    VendorOfferStatus Status
);

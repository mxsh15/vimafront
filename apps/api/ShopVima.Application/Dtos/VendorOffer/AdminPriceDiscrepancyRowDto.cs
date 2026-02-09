namespace ShopVima.Application.Dtos.VendorOffer;

public record AdminPriceDiscrepancyRowDto(
    Guid ProductId,
    string ProductTitle,
    int OffersCount,
    decimal MinPrice,
    decimal MaxPrice,
    decimal AvgPrice,
    decimal SpreadAmount,
    decimal SpreadPercent,
    IReadOnlyList<AdminPriceDiscrepancyOfferDto> Offers
);
namespace ShopVima.Application.Dtos.ShippingZones;

public record AdminShippingZoneRateDto(
    Guid ShippingMethodId,
    decimal Price,
    decimal? MinOrderAmount,
    decimal? FreeShippingMinOrderAmount,
    int? EtaDaysMin,
    int? EtaDaysMax
);

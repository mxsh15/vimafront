namespace ShopVima.Application.Dtos.Checkout;

public record ShippingOptionDto(
    Guid ShippingRateId,
    Guid ShippingMethodId,
    string ShippingMethodTitle,
    decimal Price,
    int? EtaDaysMin,
    int? EtaDaysMax
);

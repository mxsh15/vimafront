using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ShippingZoneRate : BaseEntity
{
    public Guid ShippingZoneId { get; set; }
    public ShippingZone ShippingZone { get; set; } = default!;

    public Guid ShippingMethodId { get; set; }
    public ShippingMethod ShippingMethod { get; set; } = default!;

    public decimal Price { get; set; } // تومان
    public decimal? MinOrderAmount { get; set; } // اگر سفارش کمتر از این بود اعمال نشود
    public decimal? FreeShippingMinOrderAmount { get; set; } // اگر بیشتر از این بود رایگان

    public int? EtaDaysMin { get; set; }
    public int? EtaDaysMax { get; set; }
}

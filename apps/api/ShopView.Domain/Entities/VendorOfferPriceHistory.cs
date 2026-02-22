using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class VendorOfferPriceHistory : BaseEntity
{
    public Guid VendorOfferId { get; set; }
    public VendorOffer VendorOffer { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = default!;

    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
}
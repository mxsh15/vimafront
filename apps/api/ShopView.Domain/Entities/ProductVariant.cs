using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public string VariantCode { get; set; } = default!;

    public ICollection<ProductVariantAttributeValue> AttributeValues { get; set; }
        = new List<ProductVariantAttributeValue>();

    public ICollection<VendorOfferVariant> VendorOfferVariants { get; set; }
        = new List<VendorOfferVariant>();
}

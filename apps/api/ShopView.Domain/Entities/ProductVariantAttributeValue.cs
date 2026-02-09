using ShopVima.Domain.Common;
using ShopVima.Domain.Entities;

public class ProductVariantAttributeValue : BaseEntity
{
    public Guid ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = default!;

    public Guid AttributeId { get; set; }
    public ProductAttribute Attribute { get; set; } = default!;

    public Guid? OptionId { get; set; }
    public AttributeOption? Option { get; set; }

    public string? RawValue { get; set; }
    public decimal? NumericValue { get; set; }
    public bool? BoolValue { get; set; }
    public DateTime? DateTimeValue { get; set; }
    public int DisplayOrder { get; set; } = 0;
}

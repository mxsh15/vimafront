using ShopVima.Domain.Common;


namespace ShopVima.Domain.Entities;

public class AttributeOption : BaseEntity
{
    public Guid AttributeId { get; set; }
    public ProductAttribute Attribute { get; set; } = default!;

    public string Value { get; set; } = default!;    // مثلاً "آبی"
    public string? DisplayLabel { get; set; }        // اگر لیبل نمایشی متفاوت باشد
    public int SortOrder { get; set; } = 0;
    public bool IsDefault { get; set; } = false;

    public ICollection<ProductAttributeValue> AttributeValues { get; set; } = new List<ProductAttributeValue>();
}
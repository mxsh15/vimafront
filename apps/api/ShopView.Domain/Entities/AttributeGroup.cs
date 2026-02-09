using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class AttributeGroup : BaseEntity
{
    public Guid AttributeSetId { get; set; }
    public AttributeSet AttributeSet { get; set; } = default!;

    public string Name { get; set; } = default!;     // "مشخصات کلی"
    public int SortOrder { get; set; } = 0;

    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
}

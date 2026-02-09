using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class AttributeSet : BaseEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public ICollection<CatalogCategory> CatalogCategories { get; set; } = new List<CatalogCategory>();
    public ICollection<AttributeGroup> Groups { get; set; } = new List<AttributeGroup>();
}

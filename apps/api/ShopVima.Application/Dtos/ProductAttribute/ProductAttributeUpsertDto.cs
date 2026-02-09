using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.ProductAttribute;

public sealed class ProductAttributeUpsertDto
{
    public Guid? Id { get; set; }
    public Guid? AttributeGroupId { get; set; }
    public string Name { get; set; } = default!;
    public string Key { get; set; } = default!;
    public string? Unit { get; set; }
    public AttributeValueType ValueType { get; set; }
    public bool IsRequired { get; set; }
    public bool IsVariantLevel { get; set; }
    public bool IsFilterable { get; set; }
    public bool IsComparable { get; set; }
    public int SortOrder { get; set; }
    public byte[]? RowVersion { get; set; }
}
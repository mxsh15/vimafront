using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.ProductAttribute;

public record ProductAttributeListItemDto(
    Guid Id,
    Guid? AttributeGroupId,
    string Name,
    string Key,
    string? Unit,
    AttributeValueType ValueType,
    bool IsRequired,
    bool IsVariantLevel,
    bool IsFilterable,
    bool IsComparable,
    int SortOrder
);
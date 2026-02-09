namespace ShopVima.Application.Dtos.Specs;

public record AttributeGroupListItemDto(
    Guid Id,
    Guid AttributeSetId,
    string AttributeSetName,
    string Name,
    int SortOrder,
    int AttributesCount,
    List<Guid> AttributeIds
);

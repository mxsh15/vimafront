namespace ShopVima.Application.Dtos.AttributeOption;

public sealed record AttributeOptionDto(
    Guid Id,
    Guid AttributeId,
    string Value,
    string? DisplayLabel,
    int SortOrder,
    bool IsDefault
);
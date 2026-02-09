using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.ProductSpec;

public record ProductSpecItemUpsertDto(
    Guid? Id,                 
    Guid AttributeId,
    Guid? AttributeGroupId, 
    AttributeValueType ValueType,
    Guid? OptionId,
    string? RawValue,
    decimal? NumericValue,
    bool? BoolValue,
    DateTime? DateTimeValue,
    int DisplayOrder
);

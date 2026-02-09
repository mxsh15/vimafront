using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.ProductSpec;

public record ProductSpecItemDto(
    Guid Id,                 
    Guid AttributeId,
    string AttributeName,
    string AttributeKey,
    AttributeValueType ValueType,
    Guid? AttributeGroupId,
    string? AttributeGroupName,
    Guid? OptionId,           
    string? RawValue,        
    decimal? NumericValue,
    bool? BoolValue,
    DateTime? DateTimeValue,
    int DisplayOrder  
);
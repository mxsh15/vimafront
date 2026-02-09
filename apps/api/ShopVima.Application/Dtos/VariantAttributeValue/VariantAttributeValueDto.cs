namespace ShopVima.Application.Dtos.VariantAttributeValue;

public record VariantAttributeValueDto(
    Guid AttributeId,
    string AttributeTitle,
    Guid OptionId,
    string OptionTitle
);

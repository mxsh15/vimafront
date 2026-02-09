namespace ShopVima.Application.Dtos.ProductVariant;

public class ProductVariantAttributeValueUpsertDto
{
    public Guid AttributeId { get; set; }
    public Guid? OptionId { get; set; }
}
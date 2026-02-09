namespace ShopVima.Application.Dtos.AttributeOption;

public sealed class UpsertAttributeOptionsRequest
{
    public Guid AttributeId { get; set; }
    public List<AttributeOptionItemDto> Items { get; set; } = new();
}

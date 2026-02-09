namespace ShopVima.Application.Dtos.AttributeOption;

public sealed class AttributeOptionItemDto
{
    public Guid? Id { get; set; }
    public string Value { get; set; } = default!;
    public string? DisplayLabel { get; set; }
    public int SortOrder { get; set; }
    public bool IsDefault { get; set; }
}
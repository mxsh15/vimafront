namespace ShopVima.Application.Dtos.AttributeOption;

public class CreateAttributeOptionRequest
{
    public Guid AttributeId { get; set; }
    public string Value { get; set; } = default!;
    public string? DisplayLabel { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsDefault { get; set; } = false;
}

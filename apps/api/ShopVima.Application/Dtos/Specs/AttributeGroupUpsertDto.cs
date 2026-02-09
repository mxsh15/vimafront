namespace ShopVima.Application.Dtos.Specs;

public class AttributeGroupUpsertDto
{
    public Guid AttributeSetId { get; set; }
    public string Name { get; set; } = default!;
    public int SortOrder { get; set; }
    public string? RowVersion { get; set; }
    public List<Guid> AttributeIds { get; set; } = new();
}
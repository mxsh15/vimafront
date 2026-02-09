using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductFeature : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string? Value { get; set; }
    public int SortOrder { get; set; } = 0;
}

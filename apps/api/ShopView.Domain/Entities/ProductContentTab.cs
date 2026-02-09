using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductContentTab : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string? ContentHtml { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

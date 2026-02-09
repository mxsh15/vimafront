namespace ShopVima.Domain.Entities;

public class ProductCategoryAssignment
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid CatalogCategoryId { get; set; }
    public CatalogCategory Category { get; set; } = default!;

    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;
}

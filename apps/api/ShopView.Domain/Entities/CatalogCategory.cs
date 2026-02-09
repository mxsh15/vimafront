using ShopVima.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopVima.Domain.Entities;

public class CatalogCategory : BaseEntity
{
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? ContentHtml { get; set; }
    public string? IconUrl { get; set; }

    public Guid? ParentId { get; set; }
    public CatalogCategory? Parent { get; set; }
    public ICollection<CatalogCategory> Children { get; set; } = new List<CatalogCategory>();

    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public SeoMetadata Seo { get; set; } = new();

    public Guid? AttributeSetId { get; set; }
    public AttributeSet? AttributeSet { get; set; }

    public ICollection<ProductCategoryAssignment> ProductCategoryAssignments { get; set; } = new List<ProductCategoryAssignment>();

    [NotMapped]
    public IEnumerable<Product> Products => ProductCategoryAssignments.Select(pc => pc.Product);
}

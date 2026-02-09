namespace ShopVima.Application.Dtos.Category;

public class CategoryUpsertDto
{
    public string Title { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? ContentHtml { get; set; }
    public string? IconUrl { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // بسته به ساختار SeoMetadata خودت اینو تنظیم کن
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
}

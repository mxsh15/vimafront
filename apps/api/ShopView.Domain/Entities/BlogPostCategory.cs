namespace ShopVima.Domain.Entities;

public class BlogPostCategory
{
    public Guid PostId { get; set; }
    public BlogPost Post { get; set; } = default!;

    public Guid CategoryId { get; set; }
    public BlogCategory Category { get; set; } = default!;
}
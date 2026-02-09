namespace ShopVima.Domain.Entities;

public class BlogPostTag
{
    public Guid PostId { get; set; }
    public BlogPost Post { get; set; } = default!;

    public Guid TagId { get; set; }
    public BlogTag Tag { get; set; } = default!;
}
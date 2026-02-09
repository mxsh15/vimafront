using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductQuestion : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Question { get; set; } = default!;
    public bool IsAnswered { get; set; } = false;

    public ICollection<ProductAnswer> Answers { get; set; } = new List<ProductAnswer>();
}


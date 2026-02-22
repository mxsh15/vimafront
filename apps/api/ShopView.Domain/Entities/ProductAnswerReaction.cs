using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductAnswerReaction : BaseEntity
{
    public Guid ProductAnswerId { get; set; }
    public ProductAnswer ProductAnswer { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    // 1 = Like, -1 = Dislike
    public int Value { get; set; }
}

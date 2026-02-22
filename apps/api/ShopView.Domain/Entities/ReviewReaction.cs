using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ReviewReaction : BaseEntity
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    // 1 = Like, -1 = Dislike
    public int Value { get; set; }
}

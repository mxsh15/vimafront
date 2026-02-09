using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class Wishlist : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string? Name { get; set; } // نام لیست (مثل "لیست تولد")
    public bool IsDefault { get; set; } = true;

    public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}


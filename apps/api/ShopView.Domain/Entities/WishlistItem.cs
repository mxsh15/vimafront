using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class WishlistItem : BaseEntity
{
    public Guid WishlistId { get; set; }
    public Wishlist Wishlist { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? VendorOfferId { get; set; }
    public VendorOffer? VendorOffer { get; set; }
}


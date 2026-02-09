using ShopVima.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopVima.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid? VendorOfferId { get; set; }
    public VendorOffer? VendorOffer { get; set; }

    public Guid? ProductVariantId { get; set; }
    public ProductVariant? ProductVariant { get; set; }

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }

    [NotMapped]
    public decimal TotalPrice => UnitPrice * Quantity;
}


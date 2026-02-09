using ShopVima.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopVima.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    [NotMapped]
    public decimal TotalPrice => Items.Sum(i => i.TotalPrice);

    [NotMapped]
    public int TotalItems => Items.Sum(i => i.Quantity);
}


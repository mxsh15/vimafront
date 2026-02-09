using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ShippingAddress : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public string Title { get; set; } = default!; // مثل "خانه"، "اداره"
    public string Province { get; set; } = default!;
    public string City { get; set; } = default!;
    public string AddressLine { get; set; } = default!;
    public string? PostalCode { get; set; }
    public bool IsDefault { get; set; } = false;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}


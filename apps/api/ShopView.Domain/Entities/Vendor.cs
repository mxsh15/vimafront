using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class Vendor : BaseEntity
{
    public string StoreName { get; set; } = default!;
    public string? LegalName { get; set; }
    public string? NationalId { get; set; }

    public string? PhoneNumber { get; set; }
    public string? MobileNumber { get; set; }

    public decimal? DefaultCommissionPercent { get; set; }

    public ICollection<Product> OwnedProducts { get; set; } = new List<Product>();
    public ICollection<VendorOffer> Offers { get; set; } = new List<VendorOffer>();
    public ICollection<VendorMember> Members { get; set; } = new List<VendorMember>();

}

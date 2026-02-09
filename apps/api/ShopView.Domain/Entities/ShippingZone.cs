using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ShippingZone : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;
    public string? CountryCode { get; set; }   // مثلا IR
    public string? Province { get; set; }      // مثلا تهران
    public string? City { get; set; }          // مثلا تهران
    public string? PostalCodePattern { get; set; } // regex یا starts-with
    public ICollection<ShippingZoneRate> Rates { get; set; } = new List<ShippingZoneRate>();
}

using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class VendorOfferModerationLog : BaseEntity
{
    public Guid VendorOfferId { get; set; }
    public VendorOffer VendorOffer { get; set; } = default!;

    public Guid AdminUserId { get; set; }
    public VendorOfferModerationAction Action { get; set; }

    public string? Notes { get; set; }
}
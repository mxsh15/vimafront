using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class VendorMember : BaseEntity
{
    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    // نقش این کاربر در این فروشگاه: Owner, Manager, Staff, Support, ...
    public string Role { get; set; } = "Owner";
    public bool IsActive { get; set; } = true;
}
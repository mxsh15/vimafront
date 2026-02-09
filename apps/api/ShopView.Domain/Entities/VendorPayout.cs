using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class VendorPayout : BaseEntity
{
    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = default!;

    public decimal Amount { get; set; }
    public PayoutStatus Status { get; set; } = PayoutStatus.Pending;

    public string? BankAccountInfo { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? ShabaNumber { get; set; }

    public string? AdminNotes { get; set; }
    public Guid? ProcessedBy { get; set; } // Admin User ID

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
}


using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class VendorWallet : BaseEntity
{
    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = default!;

    public decimal Balance { get; set; } = 0; // موجودی قابل برداشت
    public decimal PendingBalance { get; set; } = 0; // در انتظار پرداخت
    public decimal TotalEarnings { get; set; } = 0; // کل درآمد
    public decimal TotalWithdrawn { get; set; } = 0; // کل برداشت شده

    public ICollection<VendorTransaction> Transactions { get; set; } = new List<VendorTransaction>();
}


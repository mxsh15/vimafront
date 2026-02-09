using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class VendorTransaction : BaseEntity
{
    public Guid VendorWalletId { get; set; }
    public VendorWallet Wallet { get; set; } = default!;

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; } // موجودی بعد از تراکنش

    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; }
}


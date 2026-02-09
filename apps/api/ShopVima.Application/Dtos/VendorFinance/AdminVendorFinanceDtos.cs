namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminVendorWalletListItemDto(
    Guid VendorId,
    string StoreName,
    decimal Balance,
    decimal PendingBalance,
    decimal TotalEarnings,
    decimal TotalWithdrawn,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

namespace ShopVima.Application.Dtos.Vendor;

public record VendorWalletDto(
    Guid Id,
    Guid VendorId,
    decimal Balance,
    decimal PendingBalance,
    decimal TotalEarnings,
    decimal TotalWithdrawn
);


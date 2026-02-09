namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminWalletAdjustmentDto(
    decimal Amount,
    string? Description,
    string? ReferenceNumber
);

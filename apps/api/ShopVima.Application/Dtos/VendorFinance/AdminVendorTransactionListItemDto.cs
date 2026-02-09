using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminVendorTransactionListItemDto(
    Guid Id,
    Guid VendorId,
    string StoreName,
    TransactionType Type,
    decimal Amount,
    decimal BalanceAfter,
    Guid? OrderId,
    string? Description,
    string? ReferenceNumber,
    DateTime CreatedAtUtc
);

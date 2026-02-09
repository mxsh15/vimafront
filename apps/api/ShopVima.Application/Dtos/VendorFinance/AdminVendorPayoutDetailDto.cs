using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminVendorPayoutDetailDto(
    Guid Id,
    Guid VendorId,
    string StoreName,
    decimal Amount,
    PayoutStatus Status,
    string? BankAccountInfo,
    string? BankName,
    string? AccountNumber,
    string? ShabaNumber,
    string? AdminNotes,
    Guid? ProcessedBy,
    DateTime RequestedAt,
    DateTime? ProcessedAt,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

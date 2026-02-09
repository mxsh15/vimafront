using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminVendorPayoutListItemDto(
    Guid Id,
    Guid VendorId,
    string StoreName,
    decimal Amount,
    PayoutStatus Status,
    string? BankName,
    string? AccountNumber,
    string? ShabaNumber,
    DateTime RequestedAt,
    DateTime? ProcessedAt,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

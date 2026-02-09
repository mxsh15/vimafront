using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Vendor;

public record VendorDto(
    Guid Id,
    string StoreName,
    string? LegalName,
    string? NationalId,
    string? PhoneNumber,
    string? MobileNumber,
    decimal? DefaultCommissionPercent,
    Guid? OwnerUserId,
    string? OwnerUserName,
    DateTime CreatedAtUtc,
    bool Status
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


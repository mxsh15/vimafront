namespace ShopVima.Application.Dtos.Vendor;

public record VendorCreateDto(
    string StoreName,
    string? LegalName,
    string? NationalId,
    string? PhoneNumber,
    string? MobileNumber,
    decimal? DefaultCommissionPercent,
    Guid? OwnerUserId
);


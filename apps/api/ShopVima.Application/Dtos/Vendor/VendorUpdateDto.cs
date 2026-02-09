namespace ShopVima.Application.Dtos.Vendor;

public record VendorUpdateDto(
    string StoreName,
    string? LegalName,
    string? NationalId,
    string? PhoneNumber,
    string? MobileNumber,
    decimal? DefaultCommissionPercent,
    bool Status
);


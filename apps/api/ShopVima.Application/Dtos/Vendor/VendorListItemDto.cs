namespace ShopVima.Application.Dtos.Vendor;

public record VendorListItemDto(
    Guid Id,
    string StoreName,
    string? LegalName,
    string? NationalId,
    string? PhoneNumber,
    string? MobileNumber,
    decimal? DefaultCommissionPercent,
    Guid? OwnerUserId,
    string? OwnerUserName,
    int ProductsCount,
    int OrdersCount,
    decimal? TotalSales,
    bool Status,
    DateTime CreatedAtUtc
);


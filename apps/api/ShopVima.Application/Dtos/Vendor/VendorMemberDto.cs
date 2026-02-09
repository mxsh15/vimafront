namespace ShopVima.Application.Dtos.Vendor;

public record VendorMemberDto(
    Guid VendorId,
    Guid UserId,
    string UserEmail,
    string FullName,
    string Role,
    bool IsActive
);
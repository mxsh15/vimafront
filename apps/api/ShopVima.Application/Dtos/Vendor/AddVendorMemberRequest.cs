namespace ShopVima.Application.Dtos.Vendor;

public record AddVendorMemberRequest(
    Guid UserId,
    string Role
);
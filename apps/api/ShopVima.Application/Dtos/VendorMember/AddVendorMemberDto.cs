namespace ShopVima.Application.Dtos.VendorMember;

public record AddVendorMemberDto(
    Guid UserId,
    string Role,
    bool IsActive
);

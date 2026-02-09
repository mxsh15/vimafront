namespace ShopVima.Application.Dtos.VendorMember;

public record VendorMemberListItemDto(
    Guid Id,
    Guid VendorId,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string Role,
    bool IsActive,
    DateTime CreatedAtUtc
);

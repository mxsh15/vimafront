using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.User;

public record UserUpdateDto(
    string Email,
    string? Password,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    UserRole Role,
    Guid? RoleId,
    List<Guid>? VendorIds,
    bool Status
);


using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.User;

public record UserDto(
    Guid Id,
    string Email,
    string? PhoneNumber,
    string FirstName,
    string LastName,
    string FullName,
    UserRole Role,
    Guid? RoleId,
    string? RoleName,
    List<Guid> VendorIds,
    bool EmailVerified,
    DateTime? LastLoginAt,
    DateTime CreatedAtUtc,
    bool Status
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


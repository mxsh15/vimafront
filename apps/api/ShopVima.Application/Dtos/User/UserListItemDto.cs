using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.User;

public record UserListItemDto(
    Guid Id,
    string Email,
    string FullName,
    string? PhoneNumber,
    UserRole Role,
    Guid? RoleId,
    string? RoleName,
    bool EmailVerified,
    DateTime? LastLoginAt,
    DateTime CreatedAtUtc,
    bool Status
);


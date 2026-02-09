namespace ShopVima.Application.Dtos.Role;

public record RoleListItemDto(
    Guid Id,
    string Name,
    string? Description,
    int UsersCount,
    int PermissionsCount,
    DateTime CreatedAtUtc,
    bool Status
);


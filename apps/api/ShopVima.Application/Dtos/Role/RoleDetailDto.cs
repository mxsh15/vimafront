namespace ShopVima.Application.Dtos.Role;

public record RoleDetailDto(
    Guid Id,
    string Name,
    string? Description,
    List<PermissionDto> Permissions,
    DateTime CreatedAtUtc,
    bool Status
);

public record PermissionDto(
    Guid Id,
    string Name,
    string? DisplayName,
    string? Category
);


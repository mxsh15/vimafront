namespace ShopVima.Application.Dtos.Permission;

public record PermissionListItemDto(
    Guid Id,
    string Name,
    string? DisplayName,
    string? Category,
    int RolesCount,
    DateTime CreatedAtUtc,
    bool Status
);


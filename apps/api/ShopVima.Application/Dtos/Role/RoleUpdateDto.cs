namespace ShopVima.Application.Dtos.Role;

public record RoleUpdateDto(
    string Name,
    string? Description,
    List<Guid> PermissionIds,
    bool Status
);


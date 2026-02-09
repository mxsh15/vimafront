namespace ShopVima.Application.Dtos.Role;

public record RoleCreateDto(
    string Name,
    string? Description,
    List<Guid> PermissionIds
);


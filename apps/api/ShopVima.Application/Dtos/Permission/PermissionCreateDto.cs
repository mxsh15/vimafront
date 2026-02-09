namespace ShopVima.Application.Dtos.Permission;

public record PermissionCreateDto(
    string Name,
    string? DisplayName,
    string? Description,
    string? Category
);


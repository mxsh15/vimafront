namespace ShopVima.Application.Dtos.Permission;

public record PermissionUpdateDto(
    string Name,
    string? DisplayName,
    string? Description,
    string? Category,
    bool Status
);


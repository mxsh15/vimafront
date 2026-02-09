using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Permission;

public record PermissionDto(
    Guid Id,
    string Name,
    string? DisplayName,
    string? Description,
    string? Category,
    DateTime CreatedAtUtc,
    bool Status
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


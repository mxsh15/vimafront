using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Role;

public record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime CreatedAtUtc,
    bool Status
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


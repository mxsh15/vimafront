using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.AttributeSet;

public record AttributeSetDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

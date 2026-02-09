using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Tag;

public record TagDto(Guid Id, string Name, string Slug,
    DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, bool IsDeleted, string RowVersion)
    : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

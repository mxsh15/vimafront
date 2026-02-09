using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.ProductFeature;

public record ProductFeatureDto(Guid Id, Guid ProductId, string Title, string? Value, int SortOrder,
    DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, bool IsDeleted, string RowVersion)
    : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.ProductContentTab;

public record ProductContentTabDto(Guid Id, Guid ProductId, string Title, string? ContentHtml, int SortOrder, bool IsActive,
    DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, bool IsDeleted, string RowVersion)
    : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

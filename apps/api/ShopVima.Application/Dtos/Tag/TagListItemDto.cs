namespace ShopVima.Application.Dtos.Tag;

public record TagListItemDto(
    Guid Id,
    string Name,
    string Slug,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted
);
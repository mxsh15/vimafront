namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record AdminHomeTemplateListItemDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    string? ThumbnailUrl,
    bool IsSystem,
    bool IsEnabled,
    bool IsActiveForStore, // آیا همین قالب الان قالب فعال فروشگاه است؟
    int SectionsCount,
    DateTime CreatedAtUtc
);

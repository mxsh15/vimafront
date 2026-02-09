namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record AdminHomeTemplateDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string? Description,
    Guid? ThumbnailMediaAssetId,
    string? ThumbnailUrl,
    bool IsSystem,
    bool IsEnabled,
    bool IsActiveForStore,
    List<AdminHomeTemplateSectionDto> Sections
);

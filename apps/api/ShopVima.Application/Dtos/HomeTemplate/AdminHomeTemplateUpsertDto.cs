namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record AdminHomeTemplateUpsertDto(
    string Title,
    string Slug,
    string? Description,
    Guid? ThumbnailMediaAssetId,
    bool IsEnabled
);

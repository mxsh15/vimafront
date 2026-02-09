namespace ShopVima.Application.Dtos.QuickService;

public sealed record PublicQuickServiceDto(
    Guid MediaAssetId,
    string MediaUrl,
    string Title,
    string? LinkUrl
);

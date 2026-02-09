namespace ShopVima.Application.Dtos.QuickService;

public sealed record AdminQuickServiceListItemDto(
    Guid Id,
    Guid MediaAssetId,
    string MediaUrl,
    string Title,
    string? LinkUrl,
    int SortOrder,
    bool IsActive
);

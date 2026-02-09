using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record AdminHomeTemplateSectionDto(
    Guid? Id,
    HomeSectionType Type,
    string Title,
    int SortOrder,
    bool IsEnabled,
    string ConfigJson
);

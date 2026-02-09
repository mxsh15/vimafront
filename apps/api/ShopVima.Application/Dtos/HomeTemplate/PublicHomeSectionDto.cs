using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record PublicHomeSectionDto(
    HomeSectionType Type,
    string ConfigJson
);

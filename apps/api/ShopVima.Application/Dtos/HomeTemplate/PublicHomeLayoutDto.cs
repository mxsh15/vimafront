namespace ShopVima.Application.Dtos.HomeTemplate;

public sealed record PublicHomeLayoutDto(
    Guid? TemplateId,
    string? TemplateSlug,
    List<PublicHomeSectionDto> Sections
);

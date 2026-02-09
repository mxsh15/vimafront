using ShopVima.Application.Dtos.Common;
using System.ComponentModel.DataAnnotations;

namespace ShopVima.Application.Dtos.Brand;

public record BrandCreateUpdateDto
{
    [Required, MaxLength(256)] 
    public string Title { get; init; } = default!;

    [MaxLength(256)] 
    public string? EnglishTitle { get; init; }

    [Required, MaxLength(256)] 
    public string Slug { get; init; } = default!;

    [MaxLength(1024)] 
    public string? WebsiteUrl { get; init; }

    public string? ContentHtml { get; init; }
    public string? LogoUrl { get; init; }
    public SeoMetadataDto? Seo { get; init; }
    public string? RowVersion { get; init; }
}

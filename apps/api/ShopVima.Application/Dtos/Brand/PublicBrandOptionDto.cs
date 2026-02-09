namespace ShopVima.Application.Dtos.Brand;

public sealed class PublicBrandOptionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Slug { get; set; } = "";
    public string? LogoUrl { get; set; }
}

using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.MediaAsset;

public class MediaUpdateDto
{
    public string? AltText { get; set; }
    public string? Title { get; set; }
    public MediaUsage? Usage { get; set; }
}
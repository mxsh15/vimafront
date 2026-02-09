using System.ComponentModel.DataAnnotations;


namespace ShopVima.Application.Dtos.HomeBanner;

public sealed class AdminHomeBannerUpsertDto
{
    [Required]
    public Guid MediaAssetId { get; set; }

    [MaxLength(2048)]
    public string? LinkUrl { get; set; }

    [MaxLength(256)]
    public string? Title { get; set; }

    [MaxLength(256)]
    public string? AltText { get; set; }

    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public DateTimeOffset? StartAt { get; set; }
    public DateTimeOffset? EndAt { get; set; }
}
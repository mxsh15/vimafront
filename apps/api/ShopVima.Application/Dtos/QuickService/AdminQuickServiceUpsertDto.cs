using System.ComponentModel.DataAnnotations;

namespace ShopVima.Application.Dtos.QuickService;

public sealed class AdminQuickServiceUpsertDto
{
    [Required]
    public Guid MediaAssetId { get; set; }

    [Required]
    [MaxLength(128)]
    public string Title { get; set; } = null!;

    [MaxLength(2048)]
    public string? LinkUrl { get; set; }

    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

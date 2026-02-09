using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Domain.Entities;

public class HomeTemplateSection : BaseEntity
{
    public Guid HomeTemplateId { get; set; }
    public HomeTemplate HomeTemplate { get; set; } = null!;
    public HomeSectionType Type { get; set; }
    public string Title { get; set; } = null!;
    public int SortOrder { get; set; }
    public bool IsEnabled { get; set; } = true;
    public string ConfigJson { get; set; } = "{}";
}

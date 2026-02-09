using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ShippingMethod : BaseEntity
{
    public string Title { get; set; } = default!;
    public string Code { get; set; } = default!; // unique, e.g. "post", "tipax"
    public string? Description { get; set; }

    public int SortOrder { get; set; } = 0;
    public decimal? DefaultPrice { get; set; }
}

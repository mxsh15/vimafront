using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ExternalIdMap : BaseEntity
{
    public string Provider { get; set; } = "nobelfarm";
    public string EntityType { get; set; } = default!; // Product, Category, BlogPost, Attribute, Option, Media...
    public string ExternalId { get; set; } = default!;  // مثلا "123" (id وردپرس/ووکامرس)
    public Guid InternalId { get; set; }                // Guid داخل دیتابیس شما
    public string? ExternalSlug { get; set; }
    public DateTime LastSyncedAtUtc { get; set; } = DateTime.UtcNow;
}


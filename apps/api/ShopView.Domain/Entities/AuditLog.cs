using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class AuditLog : BaseEntity
{
    // who
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }

    // what
    public string Method { get; set; } = "GET";
    public string Path { get; set; } = "/";
    public string? QueryString { get; set; }

    // result
    public int StatusCode { get; set; }
    public long DurationMs { get; set; }

    // meta
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    // optional enrichment
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? Action { get; set; }  // e.g. "ApproveOffer", "HardDelete", ...
    public string? Notes { get; set; }   // optional
}

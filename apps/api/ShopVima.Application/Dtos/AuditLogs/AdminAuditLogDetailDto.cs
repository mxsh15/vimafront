namespace ShopVima.Application.Dtos.AuditLogs;

public record AdminAuditLogDetailDto(
    Guid Id,
    DateTime CreatedAtUtc,
    Guid? UserId,
    string? UserEmail,
    string Method,
    string Path,
    string? QueryString,
    int StatusCode,
    long DurationMs,
    string? IpAddress,
    string? UserAgent,
    string? EntityType,
    Guid? EntityId,
    string? Action,
    string? Notes
);
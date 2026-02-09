namespace ShopVima.Application.Dtos.AuditLogs;

public record AdminAuditLogListItemDto(
        Guid Id,
        DateTime CreatedAtUtc,
        Guid? UserId,
        string? UserEmail,
        string Method,
        string Path,
        int StatusCode,
        long DurationMs
    );

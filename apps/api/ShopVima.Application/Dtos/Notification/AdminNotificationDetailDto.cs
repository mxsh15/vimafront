using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Notification;

public record AdminNotificationDetailDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string Title,
    string Message,
    NotificationType Type,
    bool IsRead,
    DateTime? ReadAt,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    string? ActionUrl,
    DateTime CreatedAtUtc
);

using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Notification;

public record AdminNotificationListItemDto(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    string Title,
    NotificationType Type,
    bool IsRead,
    DateTime CreatedAtUtc,
    string? ActionUrl
);

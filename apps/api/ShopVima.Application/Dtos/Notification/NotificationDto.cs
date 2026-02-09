using ShopVima.Application.Dtos.Common;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Notification;

public record NotificationDto(
    Guid Id,
    Guid UserId,
    string Title,
    string Message,
    NotificationType Type,
    bool IsRead,
    DateTime? ReadAt,
    string? RelatedEntityType,
    Guid? RelatedEntityId,
    string? ActionUrl,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


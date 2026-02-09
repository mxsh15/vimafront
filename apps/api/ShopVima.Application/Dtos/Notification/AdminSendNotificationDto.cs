using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Notification;

public record AdminSendNotificationDto(
    string Target, // "All" | "User" | "Role" | "Vendor"
    Guid? UserId,
    Guid? RoleId,
    Guid? VendorId,
    string Title,
    string Message,
    NotificationType Type,
    string? ActionUrl,
    string? RelatedEntityType,
    Guid? RelatedEntityId
);

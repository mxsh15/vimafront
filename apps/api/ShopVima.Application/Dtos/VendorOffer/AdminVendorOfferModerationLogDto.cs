using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.VendorOffer;

public record AdminVendorOfferModerationLogDto(
    Guid Id,
    Guid VendorOfferId,
    Guid AdminUserId,
    string? AdminEmail,
    string? AdminFullName,
    VendorOfferModerationAction Action,
    string? Notes,
    DateTime CreatedAtUtc
);

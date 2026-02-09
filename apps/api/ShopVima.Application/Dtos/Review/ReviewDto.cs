using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Review;

public record ReviewDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    Guid UserId,
    string UserFullName,
    int Rating,
    string? Title,
    string? Comment,
    bool IsApproved,
    bool IsVerifiedPurchase,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);


namespace ShopVima.Application.Dtos.Common;

public record BaseDto(
    Guid Id,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion
);

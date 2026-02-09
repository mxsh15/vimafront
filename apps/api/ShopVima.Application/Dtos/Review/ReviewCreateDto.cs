namespace ShopVima.Application.Dtos.Review;

public record ReviewCreateDto(
    Guid ProductId,
    int Rating,
    string? Title,
    string? Comment,
    Guid? OrderItemId
);


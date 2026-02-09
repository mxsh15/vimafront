namespace ShopVima.Application.Dtos.Returns;

public record AdminReturnReviewDto(
    bool Approve,
    string? AdminNotes
);

namespace ShopVima.Application.Dtos.ProductQuestion;

public record ProductQuestionCreateDto(
    Guid ProductId,
    string Question
);
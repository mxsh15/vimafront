namespace ShopVima.Application.Dtos.ProductQuestion;

public record ProductQuestionDetailDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    Guid UserId,
    string UserFullName,
    string Question,
    bool IsAnswered,
    DateTime CreatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion,
    IReadOnlyList<ProductAnswerAdminDto> Answers
);

using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.ProductQuestion;

public record ProductQuestionDto(
    Guid Id,
    Guid ProductId,
    string ProductTitle,
    Guid UserId,
    string UserFullName,
    string Question,
    bool IsApproved,
    bool IsAnswered,
    int AnswersCount,
    DateTime CreatedAtUtc
) : BaseDto(Id, CreatedAtUtc, null, false, string.Empty);

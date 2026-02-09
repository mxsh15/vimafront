namespace ShopVima.Application.Dtos.ProductQuestion;

public record ProductAnswerDto(
    Guid Id,
    Guid QuestionId,
    string Answer,
    bool IsVerified,
    Guid? VendorId,
    string? VendorName,
    Guid? UserId,
    string? UserFullName,
    DateTime CreatedAtUtc
);

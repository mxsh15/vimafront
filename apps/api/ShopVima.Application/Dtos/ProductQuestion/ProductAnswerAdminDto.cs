namespace ShopVima.Application.Dtos.ProductQuestion;

public record ProductAnswerAdminDto(
    Guid Id,
    Guid QuestionId,
    string Answer,
    bool IsVerified,
    Guid? VendorId,
    string? VendorName,
    Guid? UserId,
    string? UserFullName,
    DateTime CreatedAtUtc,
    bool IsDeleted,
    DateTime? DeletedAtUtc,
    string RowVersion
);

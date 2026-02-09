namespace ShopVima.Application.Dtos.AttributeSet;

public record AttributeSetUpsertDto(
    string Name,
    string? Description,
    string? RowVersion
);

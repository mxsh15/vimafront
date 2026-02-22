namespace ShopVima.Application.Dtos.Compare;

public record CompareRowDto(
    string Title,
    string? Unit,
    List<string?> Values
);

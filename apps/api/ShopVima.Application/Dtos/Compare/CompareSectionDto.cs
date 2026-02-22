namespace ShopVima.Application.Dtos.Compare;

public record CompareSectionDto(
    string Title,
    List<CompareRowDto> Rows
);

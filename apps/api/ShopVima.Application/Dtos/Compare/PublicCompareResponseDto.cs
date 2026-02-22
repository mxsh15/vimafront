namespace ShopVima.Application.Dtos.Compare;

public record PublicCompareResponseDto(
    List<CompareProductDto> Products,
    List<CompareSectionDto> Sections
);
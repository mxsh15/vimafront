namespace ShopVima.Application.Dtos.Reports;

public record ReportsOverviewDto(
    int Actions24h,
    int Actions7d,
    int Errors24h,
    int Errors7d,
    IReadOnlyList<TopRowDto> TopPaths24h,
    IReadOnlyList<TopRowDto> TopUsers24h
);

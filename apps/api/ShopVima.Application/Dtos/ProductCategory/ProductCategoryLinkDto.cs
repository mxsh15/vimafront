namespace ShopVima.Application.Dtos.ProductCategory;

public record ProductCategoryLinkDto(Guid CategoryId, bool IsPrimary = false, int SortOrder = 0);

namespace ShopVima.Application.Dtos.ProductSpec;

public record UpsertProductSpecsRequest(
    Guid ProductId,
    List<ProductSpecItemUpsertDto> Items
);
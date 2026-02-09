using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.ProductVariant;

public record ProductVariantDetailDto(
    Guid Id,
    Guid? AttributeId,
    Guid? OptionId,
    string? Sku,
    decimal? Price,
    decimal? OldPrice,
    decimal? MinVariablePrice,
    decimal? MaxVariablePrice,
    decimal? WeightKg,
    decimal? LengthCm,
    decimal? WidthCm,
    decimal? HeightCm,
    string? Description,
    int? MinOrderQuantity,
    int? MaxOrderQuantity,
    int? QuantityStep,
    int? StockQuantity,
    bool? ManageStock,
    StockStatus? StockStatus,
    BackorderPolicy? BackorderPolicy,
    int? LowStockThreshold
);
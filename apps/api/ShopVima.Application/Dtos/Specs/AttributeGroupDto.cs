using ShopVima.Application.Dtos.Common;

namespace ShopVima.Application.Dtos.Specs;

public record AttributeGroupDto(
    Guid Id,
    Guid AttributeSetId,
    string AttributeSetName,
    string Name,
    int SortOrder,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    bool IsDeleted,
    string RowVersion,
    List<Guid> AttributeIds
) : BaseDto(Id, CreatedAtUtc, UpdatedAtUtc, IsDeleted, RowVersion);

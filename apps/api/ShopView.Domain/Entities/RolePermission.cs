using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

// جدول واسط برای رابطه many-to-many بین Role و Permission
public class RolePermission : BaseEntity
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = default!;
    
    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = default!;
}


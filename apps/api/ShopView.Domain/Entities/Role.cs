using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = default!; // نام نقش (مثلاً: "مدیر", "کاربر", "فروشنده")
    public string? Description { get; set; } // توضیحات نقش
    
    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<User> Users { get; set; } = new List<User>();
}


using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class Permission : BaseEntity
{
    public string Name { get; set; } = default!; // نام دسترسی (مثلاً: "products.view", "products.edit", "products.delete")
    public string? DisplayName { get; set; } // نام نمایشی (مثلاً: "مشاهده محصولات")
    public string? Description { get; set; } // توضیحات دسترسی
    public string? Category { get; set; } // دسته‌بندی (مثلاً: "products", "orders", "users")
    
    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}


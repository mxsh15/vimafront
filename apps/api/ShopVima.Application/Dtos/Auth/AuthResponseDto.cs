namespace ShopVima.Application.Dtos.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = default!;
    public UserDto User { get; set; } = default!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = default!;
    public Guid? VendorId { get; set; } // برای سازگاری با کدهای قدیمی - اولین Vendor با نقش Owner
    public List<Guid> VendorIds { get; set; } = new(); // لیست تمام Vendorهایی که کاربر عضو آنهاست
    public List<VendorInfoDto> Vendors { get; set; } = new(); // اطلاعات کامل Vendorها
}

public class VendorInfoDto
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = default!;
    public string Role { get; set; } = default!; // نقش کاربر در این Vendor (Owner, Manager, Staff, ...)
    public bool IsActive { get; set; }
}


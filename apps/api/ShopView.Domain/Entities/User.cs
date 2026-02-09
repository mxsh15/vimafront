using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopVima.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string? DisplayName { get; set; }
    public UserRole Role { get; set; } = Enums.UserRole.Customer;
    
    public Guid? RoleId { get; set; }
    public Role? UserRole { get; set; }
    
    public bool EmailVerified { get; set; } = false;
    public DateTime? EmailVerifiedAt { get; set; }
    public string? EmailVerificationToken { get; set; }
    
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpires { get; set; }
    
    public DateTime? LastLoginAt { get; set; }
    
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ShippingAddress> ShippingAddresses { get; set; } = new List<ShippingAddress>();
    public ICollection<VendorMember> VendorMemberships { get; set; } = new List<VendorMember>();

    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";
}


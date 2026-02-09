using System.ComponentModel.DataAnnotations;
using ShopVima.Domain.Enums;

namespace ShopVima.Application.Dtos.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "ایمیل الزامی است")]
    [EmailAddress(ErrorMessage = "فرمت ایمیل صحیح نیست")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "رمز عبور الزامی است")]
    [MinLength(6, ErrorMessage = "رمز عبور باید حداقل ۶ کاراکتر باشد")]
    public string Password { get; set; } = default!;

    [Required(ErrorMessage = "تکرار رمز عبور الزامی است")]
    [Compare(nameof(Password), ErrorMessage = "رمز عبور و تکرار آن یکسان نیستند")]
    public string ConfirmPassword { get; set; } = default!;

    [Required(ErrorMessage = "نام الزامی است")]
    [MaxLength(100)]
    public string FirstName { get; set; } = default!;

    [Required(ErrorMessage = "نام خانوادگی الزامی است")]
    [MaxLength(100)]
    public string LastName { get; set; } = default!;

    [Phone(ErrorMessage = "فرمت شماره تلفن صحیح نیست")]
    public string? PhoneNumber { get; set; }

    //public UserRole Role { get; set; } = UserRole.Customer;
}


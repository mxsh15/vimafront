using System.ComponentModel.DataAnnotations;

namespace ShopVima.Application.Dtos.Auth;

public sealed class EmergencyResetPasswordDto
{
    [Required(ErrorMessage = "ایمیل الزامی است")]
    [EmailAddress(ErrorMessage = "فرمت ایمیل صحیح نیست")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "رمز عبور جدید الزامی است")]
    [MinLength(6, ErrorMessage = "رمز عبور باید حداقل ۶ کاراکتر باشد")]
    public string NewPassword { get; set; } = default!;
}

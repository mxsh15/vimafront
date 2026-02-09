using ShopVima.Domain.Enums;

namespace ShopVima.Application.Services;

//public interface IPasswordHasher
//{
//    string HashPassword(string password);
//    bool VerifyPassword(string password, string hashedPassword);
//}

public interface IPasswordHasher
{
    string HashPassword(string password);
    PasswordVerificationResult VerifyPassword(string password, string hashedPassword);
}

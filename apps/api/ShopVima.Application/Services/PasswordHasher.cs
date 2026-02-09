using ShopVima.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace ShopVima.Application.Services;

public class PasswordHasher : IPasswordHasher
{

    private const string Prefix = "PBKDF2$";
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 150_000;

    public string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: Iterations,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: KeySize);

        return $"{Prefix}{Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }

    public PasswordVerificationResult VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(hashedPassword))
            return PasswordVerificationResult.Failed;

        if (hashedPassword.StartsWith(Prefix, StringComparison.Ordinal))
        {
            var parts = hashedPassword.Split('$', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 4)
                return PasswordVerificationResult.Failed;

            if (!int.TryParse(parts[1], out var iter) || iter < 50_000)
                return PasswordVerificationResult.Failed;

            byte[] salt, expectedKey;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                expectedKey = Convert.FromBase64String(parts[3]);
            }
            catch
            {
                return PasswordVerificationResult.Failed;
            }

            var actualKey = Rfc2898DeriveBytes.Pbkdf2(
                password: password,
                salt: salt,
                iterations: iter,
                hashAlgorithm: HashAlgorithmName.SHA256,
                outputLength: expectedKey.Length);

            var ok = CryptographicOperations.FixedTimeEquals(actualKey, expectedKey);
            if (!ok) return PasswordVerificationResult.Failed;

            return PasswordVerificationResult.Success;
        }

        using var sha256 = SHA256.Create();
        var legacyBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        var legacyB64 = Convert.ToBase64String(legacyBytes);

        if (CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(legacyB64),
                Encoding.UTF8.GetBytes(hashedPassword)))
        {
            return PasswordVerificationResult.SuccessRehashNeeded;
        }

        return PasswordVerificationResult.Failed;
    }



    //public string HashPassword(string password)
    //{
    //    using var sha256 = SHA256.Create();
    //    var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
    //    return Convert.ToBase64String(hashedBytes);
    //}

    //public bool VerifyPassword(string password, string hashedPassword)
    //{
    //    var hashOfInput = HashPassword(password);
    //    return hashOfInput == hashedPassword;
    //}
}


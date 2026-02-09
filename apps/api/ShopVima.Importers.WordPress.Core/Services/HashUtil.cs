using System.Security.Cryptography;
using System.Text;

namespace ShopVima.Importers.WordPress.Core.Services;

public static class HashUtil
{
    public static string Sha256Hex(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant(); // 64 chars
    }
}

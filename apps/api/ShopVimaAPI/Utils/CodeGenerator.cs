using System.Text;
using System.Text.RegularExpressions;

namespace ShopVimaAPI.Utils;

public static class CodeGenerator
{
    public static string ToCode(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "shipping";

        var s = input.Trim().ToLowerInvariant();

        s = Regex.Replace(s, @"\s+", "-");
        s = Regex.Replace(s, @"[^a-z0-9\-]+", "");

        s = Regex.Replace(s, @"\-{2,}", "-").Trim('-');

        return string.IsNullOrWhiteSpace(s) ? "shipping" : s;
    }

    public static string ShortToken(int len = 6)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var rnd = Random.Shared;
        var sb = new StringBuilder(len);
        for (int i = 0; i < len; i++)
            sb.Append(chars[rnd.Next(chars.Length)]);
        return sb.ToString();
    }
}

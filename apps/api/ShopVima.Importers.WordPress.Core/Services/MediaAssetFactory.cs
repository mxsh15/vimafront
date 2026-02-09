using System.Security.Cryptography;
using System.Text;

namespace ShopVima.Importers.WordPress.Core.Services;

public static class MediaAssetFactory
{
    public static string GetFileNameFromUrl(string url)
    {
        try
        {
            // url ممکنه query داشته باشه
            var uri = new Uri(url);
            var name = Path.GetFileName(uri.LocalPath);

            if (!string.IsNullOrWhiteSpace(name))
                return SanitizeFileName(name);

            // اگر اسم نداشت، fallback
            return "wp-" + ShortHash(url) + ".jpg";
        }
        catch
        {
            return "wp-" + ShortHash(url) + ".jpg";
        }
    }

    private static string SanitizeFileName(string fileName)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
            fileName = fileName.Replace(c, '-');
        return fileName;
    }

    private static string ShortHash(string s)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(s));
        return Convert.ToHexString(bytes).Substring(0, 12).ToLowerInvariant();
    }
}

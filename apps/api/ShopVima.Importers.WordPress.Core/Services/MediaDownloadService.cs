using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Hosting;

namespace ShopVima.Importers.WordPress.Core.Services;

public sealed class MediaDownloadService
{
    private readonly HttpClient _http;
    private readonly IWebHostEnvironment? _env; 
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public MediaDownloadService(HttpClient http, IWebHostEnvironment? env = null)
    {
        _http = http;
        _env = env;
    }

    public async Task<DownloadedMediaResult> DownloadToLocalAsync(
        string remoteUrl,
        string localRootRelativeOrAbsolute,
        string? preferredFileName,
        CancellationToken ct = default)
    {
        // 1) ریشه ذخیره سازی
        string webRoot = _env?.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        Directory.CreateDirectory(webRoot);

        string localRoot;
        if (Path.IsPathRooted(localRootRelativeOrAbsolute))
            localRoot = localRootRelativeOrAbsolute;
        else
            localRoot = Path.Combine(Directory.GetCurrentDirectory(), localRootRelativeOrAbsolute);

        Directory.CreateDirectory(localRoot);

        // 2) دانلود
        using var req = new HttpRequestMessage(HttpMethod.Get, remoteUrl);
        req.Headers.UserAgent.ParseAdd("ShopVimaImporter/1.0");

        // دانلود هد برای گرفتن کانتنت تایپ (اختیاری برای بهینه سازی) یا دانلود کامل
        using var res = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
        res.EnsureSuccessStatusCode();
        var contentType = res.Content.Headers.ContentType?.MediaType;

        // 3) تعیین نام فایل
        string storedFileName;

        if (!string.IsNullOrWhiteSpace(preferredFileName))
        {
            storedFileName = SanitizeFileName(preferredFileName);
        }
        else
        {
            var ext = GuessExtension(remoteUrl, contentType);
            if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
            storedFileName = $"{Guid.NewGuid():N}{ext}";
        }
        var fullPath = Path.Combine(localRoot, storedFileName);


        await using (var fs = File.Create(fullPath))
        {
            await res.Content.CopyToAsync(fs, ct);
        }

        if (!File.Exists(fullPath))
            throw new IOException($"[DL] File not written: {fullPath}");

        var fileInfo = new FileInfo(fullPath);
        var size = fileInfo.Length;

        var relativeUrl = $"/uploads/media/{storedFileName}";

        if (string.IsNullOrWhiteSpace(contentType))
            contentType = "application/octet-stream";

        return new DownloadedMediaResult(
            storedFileName,
            fullPath,
            relativeUrl,
            contentType!,
            size
        );
    }

    public async Task<(byte[] bytes, string contentType, string fileName)> DownloadBytesAsync(string url, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, url);

        // خیلی از WAFها بدون User-Agent می‌زنن 403
        req.Headers.UserAgent.ParseAdd("Mozilla/5.0 (compatible; ShopVimaImporter/1.0)");
        req.Headers.Accept.ParseAdd("*/*");

        using var res = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);

        Console.WriteLine($"[DL] {url} => {(int)res.StatusCode} {res.ReasonPhrase}");

        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            throw new HttpRequestException($"Download failed {(int)res.StatusCode}. Body: {body[..Math.Min(400, body.Length)]}");
        }

        var bytes = await res.Content.ReadAsByteArrayAsync(ct);
        var ctHeader = res.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";

        // اسم فایل
        var fileName = Path.GetFileName(new Uri(url).AbsolutePath);
        if (string.IsNullOrWhiteSpace(fileName)) fileName = $"img_{Guid.NewGuid():N}";

        return (bytes, ctHeader, fileName);
    }

    private static string GuessExtension(string url, string? contentType)
    {
        try
        {
            var uri = new Uri(url);
            var file = Path.GetFileName(uri.LocalPath);
            var ext = Path.GetExtension(file);
            if (!string.IsNullOrWhiteSpace(ext) && ext.Length <= 10) return ext;

            return contentType switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/gif" => ".gif",
                "image/svg+xml" => ".svg",
                _ => ""
            };
        }
        catch
        {
            return "";
        }
    }

    private static string SanitizeFileName(string name)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            name = name.Replace(c, '-');
        }

        // جلوگیری از خطای "File name too long" در لینوکس/هاست
        // اگر نام خیلی طولانی باشد، آن را به یک هش کوتاه + پسوند تبدیل می‌کنیم.
        if (name.Length > 120)
        {
            var ext = Path.GetExtension(name);
            if (ext.Length > 10) ext = "";
            var hash = HashUtil.Sha256Hex(name).Substring(0, 24);
            name = $"wp_{hash}{ext}";
        }

        return name;
    }
}

public sealed record DownloadedMediaResult(
    string StoredFileName,
    string FullPath,
    string RelativeUrl,
    string ContentType,
    long FileSize
);

using ShopVima.Application.Dtos.MediaAsset;
using ShopVima.Importers.WordPress.Core.Options;
using System.Net.Http.Json;

public sealed class MediaUploadClient
{
    private readonly HttpClient _http;
    private readonly WordPressImportOptions _opt;

    public MediaUploadClient(HttpClient http, WordPressImportOptions opt)
    {
        _http = http;
        _opt = opt;
    }

    public async Task<string> UploadAsync(byte[] bytes, string fileName, string contentType, CancellationToken ct)
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        content.Add(fileContent, "file", fileName);
        content.Add(new StringContent("General"), "usage");

        var baseApi = _opt.BaseUrl.TrimEnd('/');
        var res = await _http.PostAsync($"{baseApi}/api/media/upload", content, ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        Console.WriteLine($"[UP] => {(int)res.StatusCode} {res.ReasonPhrase} body={body[..Math.Min(300, body.Length)]}");

        res.EnsureSuccessStatusCode();

        var dto = await res.Content.ReadFromJsonAsync<MediaAssetDto>(cancellationToken: ct);
        return dto!.Url;
    }
}

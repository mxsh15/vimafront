using System.Net.Http.Headers;
using System.Text.Json;

public sealed class RankMathClient
{
    private readonly HttpClient _http;

    public RankMathClient(HttpClient http)
    {
        _http = http;
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (compatible; ShopVimaImporter/1.0)");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> GetHeadHtmlAsync(string wpSiteBaseUrl, string postFullUrl, CancellationToken ct)
    {
        var baseUrl = wpSiteBaseUrl.TrimEnd('/');
        var postUrl = EnsureTrailingSlash(postFullUrl);

        var requestUrl =
            $"{baseUrl}/wp-json/rankmath/v1/getHead?url={Uri.EscapeDataString(postUrl)}";

        using var res = await _http.GetAsync(requestUrl, ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        Console.WriteLine($"[SEO] GET {requestUrl} => {(int)res.StatusCode}");

        if (!res.IsSuccessStatusCode)
            throw new HttpRequestException($"RankMath getHead failed {(int)res.StatusCode}: {body}");

        using var doc = JsonDocument.Parse(body);

        // نمونه تو: { "success": true, "head": "<title>...</title>..." }
        if (doc.RootElement.TryGetProperty("head", out var headProp))
            return headProp.GetString() ?? "";

        throw new InvalidOperationException($"RankMath response has no 'head'. Body: {body[..Math.Min(300, body.Length)]}");
    }

    private static string EnsureTrailingSlash(string url)
        => url.EndsWith("/") ? url : url + "/";
}

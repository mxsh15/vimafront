using Microsoft.Extensions.Logging;
using ShopVima.Importers.WordPress.Core.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace ShopVima.Importers.WordPress.Core.Clients;

public sealed class WpClient
{
    private readonly HttpClient _http;
    private readonly WordPressImportOptions _opt;
    private readonly ILogger<WpClient> _logger;

    public WpClient(HttpClient http, WordPressImportOptions opt, ILogger<WpClient> logger)
    {
        _http = http;
        _opt = opt;

        // Basic Auth از config
        if (!string.IsNullOrWhiteSpace(_opt.WpUsername) && !string.IsNullOrWhiteSpace(_opt.WpAppPassword))
        {
            var raw = $"{_opt.WpUsername}:{_opt.WpAppPassword}";
            var b64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", b64);
        }

        _logger = logger;
    }

    public async Task<List<T>> GetPagedAsync<T>(
        string path,
        Dictionary<string, string>? query,
        int perPage = 100,
        CancellationToken ct = default)
    {
        var page = 1;
        var all = new List<T>();

        string BuildQuery(int pageNo)
        {
            var q = new List<string> { $"per_page={perPage}", $"page={pageNo}" };
            if (query != null)
                foreach (var kv in query)
                    q.Add($"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}");
            return string.Join("&", q);
        }

        while (true)
        {
            var url = $"{path}?{BuildQuery(page)}";

            using var res = await _http.GetAsync(url, ct);

            if (!res.IsSuccessStatusCode)
            {
                var body = await res.Content.ReadAsStringAsync(ct);
                throw new HttpRequestException(
                    $"WP request failed: {(int)res.StatusCode} {res.ReasonPhrase}. Url: {_http.BaseAddress}{url}. Body: {body}",
                    null,
                    res.StatusCode);
            }

            var items = await res.Content.ReadFromJsonAsync<List<T>>(cancellationToken: ct) ?? new();
            if (items.Count == 0) break;

            all.AddRange(items);
            if (items.Count < perPage) break;

            page++;
        }

        return all;
    }

    // ✅ تست سریع اینکه اکانت اجازه edit داره یا نه
    public async Task<string> GetRawAsync(string path, Dictionary<string, string>? query, CancellationToken ct = default)
    {
        var qs = query == null ? "" : "?" + string.Join("&", query.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

        using var res = await _http.GetAsync(path + qs, ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new HttpRequestException($"WP request failed: {(int)res.StatusCode} {res.ReasonPhrase}. Body: {body}", null, res.StatusCode);
        
        return body;
    }


    public async Task<string> GetRawAsync2(string path, Dictionary<string, string>? query, CancellationToken ct = default)
    {
        var qs = query == null ? "" : "?" + string.Join("&", query.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

        var url = path + qs;

        using var res = await _http.GetAsync(url, ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        var ctHeader = res.Content.Headers.ContentType?.ToString() ?? "(none)";
        _logger.LogInformation("[WP RAW] {Status} {Url} ct={ContentType} len={Len} head={Head}",
            (int)res.StatusCode,
            url,
            ctHeader,
            body?.Length ?? 0,
            (body ?? "").Substring(0, Math.Min(200, body.Length)));

        if (!res.IsSuccessStatusCode)
            throw new HttpRequestException($"WP request failed: {(int)res.StatusCode} {res.ReasonPhrase}. Body: {body}", null, res.StatusCode);

        return body;
    }
}

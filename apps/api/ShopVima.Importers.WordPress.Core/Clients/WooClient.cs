using Microsoft.Extensions.Logging;
using ShopVima.Importers.WordPress.Core.Options;
using System.Net.Http.Json;

namespace ShopVima.Importers.WordPress.Core.Clients;

public sealed class WooClient
{
    private readonly HttpClient _http;
    private readonly WordPressImportOptions _opt;
    private readonly ILogger<WooClient> _log;

    public WooClient(HttpClient http, WordPressImportOptions opt, ILogger<WooClient> log)
    {
        _http = http;
        _opt = opt;
        _log = log;
    }

    private string SignedUrl(string apiPathWithQuery)
    {
        var baseUrl = _opt.BaseUrl.TrimEnd('/');
        var ck = _opt.Woo.ConsumerKey;
        var cs = _opt.Woo.ConsumerSecret;

        var join = apiPathWithQuery.Contains('?') ? "&" : "?";
        return $"{baseUrl}{apiPathWithQuery}{join}consumer_key={ck}&consumer_secret={cs}";
    }

    public async Task<List<T>> GetPagedAsync<T>(string apiPath, int perPage = 100, CancellationToken ct = default)
    {
        var page = 1;
        var all = new List<T>();

        while (true)
        {
            var url = SignedUrl($"{apiPath}?per_page={perPage}&page={page}");
            _log.LogInformation("[Woo] GET {Url}", url);

            HttpResponseMessage res;
            try
            {
                res = await _http.GetAsync(url, ct);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "[Woo] HTTP error calling {Url}", url);
                break;
            }

            if (!res.IsSuccessStatusCode)
            {
                var body = await res.Content.ReadAsStringAsync(ct);
                _log.LogError("[Woo] Non-success {Status} for {Url} :: {Body}",
                    (int)res.StatusCode, url, body.Length > 200 ? body[..200] : body);
                break;
            }

            var items = await res.Content.ReadFromJsonAsync<List<T>>(cancellationToken: ct) ?? new();
            _log.LogInformation("[Woo] Page {Page} items={Count}", page, items.Count);

            if (items.Count == 0) break;

            all.AddRange(items);
            page++;
        }

        _log.LogInformation("[Woo] Total items fetched={Count} for {ApiPath}", all.Count, apiPath);
        return all;
    }

    public async Task<List<T>> GetPageAsync<T>(string apiPath, int page, int perPage = 100, CancellationToken ct = default)
    {
        if (page <= 0) page = 1;

        var url = SignedUrl($"{apiPath}?per_page={perPage}&page={page}");
        _log.LogInformation("[Woo] GET {Url}", url);

        HttpResponseMessage res;
        try
        {
            res = await _http.GetAsync(url, ct);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "[Woo] HTTP error calling {Url}", url);
            return new();
        }

        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            _log.LogError("[Woo] Non-success {Status} for {Url} :: {Body}",
                (int)res.StatusCode, url, body.Length > 200 ? body[..200] : body);
            return new();
        }

        var items = await res.Content.ReadFromJsonAsync<List<T>>(cancellationToken: ct) ?? new();
        _log.LogInformation("[Woo] Page {Page} items={Count}", page, items.Count);
        return items;
    }
}

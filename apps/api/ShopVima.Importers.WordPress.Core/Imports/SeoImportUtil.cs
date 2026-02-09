using ShopVima.Importers.WordPress.Core.Options;

namespace ShopVima.Importers.WordPress.Core.Imports;

internal static class SeoImportUtil
{
    public static async Task<(string? metaTitle, string? metaDesc, string schemaJson)?> TryGetRankMathSeoAsync(
        RankMathClient rankMath,
        string wpBaseUrl,
        IEnumerable<string> urlCandidates,
        CancellationToken ct)
    {
        foreach (var url in urlCandidates)
        {
            if (string.IsNullOrWhiteSpace(url)) continue;

            try
            {
                var headHtml = await rankMath.GetHeadHtmlAsync(wpBaseUrl, url, ct);
                var (metaTitle, metaDesc, schemas) = HeadParser.Extract(headHtml);
                var schemaJson = System.Text.Json.JsonSerializer.Serialize(schemas);
                return (metaTitle, metaDesc, schemaJson);
            }
            catch
            {
                // candidate بعدی
            }
        }

        return null;
    }
}

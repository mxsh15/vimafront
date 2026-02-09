using System.Text.RegularExpressions;

namespace ShopVima.Importers.WordPress.Core.Options;

using System.Text.RegularExpressions;

public static class HeadParser
{
    private static readonly Regex TitleRx =
        new(@"<title[^>]*>(?<t>.*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline);

    private static readonly Regex DescRx =
        new(@"<meta[^>]+name\s*=\s*[""']description[""'][^>]*content\s*=\s*[""'](?<d>.*?)[""'][^>]*>",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

    private static readonly Regex JsonLdRx =
        new(@"<script[^>]+type\s*=\s*[""']application/ld\+json[""'][^>]*>(?<j>.*?)</script>",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);

    public static (string? title, string? description, List<string> schemas) Extract(string headHtml)
    {
        var tm = TitleRx.Match(headHtml);
        var dm = DescRx.Match(headHtml);

        var title = tm.Success ? System.Net.WebUtility.HtmlDecode(tm.Groups["t"].Value.Trim()) : null;
        var desc = dm.Success ? System.Net.WebUtility.HtmlDecode(dm.Groups["d"].Value.Trim()) : null;

        var schemas = new List<string>();
        foreach (Match m in JsonLdRx.Matches(headHtml))
        {
            var json = m.Groups["j"].Value.Trim();
            if (!string.IsNullOrWhiteSpace(json))
                schemas.Add(json);
        }

        return (title, desc, schemas);
    }
}


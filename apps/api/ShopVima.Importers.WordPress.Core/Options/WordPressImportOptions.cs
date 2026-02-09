namespace ShopVima.Importers.WordPress.Core.Options;

public sealed class WordPressImportOptions
{
    public string Provider { get; set; } = "nobelfarm";
    public string BaseUrl { get; set; } = "";
    public WooOptions Woo { get; set; } = new();
    public bool StoreDownloadedMediaLocally { get; set; } = true;
    public string LocalMediaRoot { get; set; } = "wwwroot/uploads/media/wp-import";
    public string WpApiPrefix { get; set; } = "/wp-json/wp/v2";
    public string? WpUsername { get; set; }
    public string? WpAppPassword { get; set; }

    public sealed class WooOptions
    {
        public string ConsumerKey { get; set; } = "";
        public string ConsumerSecret { get; set; } = "";
        public string ApiPrefix { get; set; } = "/wp-json/wc/v3"; // قابل تغییر
    }
}
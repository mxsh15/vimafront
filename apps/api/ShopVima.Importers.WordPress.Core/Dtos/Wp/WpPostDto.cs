namespace ShopVima.Importers.WordPress.Core.Dtos.Wp;

public sealed class WpPostDto
{
    public int id { get; set; }
    public DateTime? date { get; set; }      // تاریخ انتشار
    public DateTime? modified { get; set; }  // تاریخ آخرین ویرایش
    public string? slug { get; set; }
    public string? link { get; set; }
    public WpRendered? title { get; set; }
    public WpRendered? content { get; set; }
    public List<int>? categories { get; set; }
    public List<int>? tags { get; set; }
    public int featured_media { get; set; }
    public WpEmbeddedDto? _embedded { get; set; }
    public string? rank_math_title { get; set; }
    public string? rank_math_description { get; set; }
    public string? rank_math_focus_keyword { get; set; }
}

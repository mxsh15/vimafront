using Microsoft.Extensions.DependencyInjection;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Imports;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Services;
using System.Net;
using System.Net.Http.Headers;
using System.Text;

namespace ShopVima.Importers.WordPress.Core.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWordPressImporter(this IServiceCollection services, WordPressImportOptions opt)
    {
        services.AddSingleton(opt);

        //services.AddHttpClient<WpClient>();
        services.AddHttpClient<WpClient>(c =>
        {
            c.BaseAddress = new Uri(opt.BaseUrl.TrimEnd('/') + "/");
            c.Timeout = TimeSpan.FromSeconds(60);
            c.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");
            c.DefaultRequestHeaders.Accept.ParseAdd("application/json");

            if (!string.IsNullOrWhiteSpace(opt.WpUsername) && !string.IsNullOrWhiteSpace(opt.WpAppPassword))
            {
                var appPass = opt.WpAppPassword.Replace(" ", "").Trim();
                var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{opt.WpUsername}:{appPass}"));
                c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", token);
            }
        })
        .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
        {
            AutomaticDecompression = DecompressionMethods.All
        });

        services.AddHttpClient<WooClient>();

        services.AddScoped<ExternalMapService>();
        services.AddHttpClient<MediaDownloadService>();


        services.AddScoped<BlogImport>();
        services.AddScoped<BlogImagesImport>();

        services.AddScoped<ProductCatalogImport>();
        services.AddScoped<ProductsImport>();

        services.AddScoped<UsersImport>();
        services.AddScoped<VendorsImport>();
        services.AddScoped<ProductVendorLinkImport>();
        services.AddScoped<RepairVendorMembersImport>();

        services.AddScoped<ImportOrchestrator>();
        services.AddHttpClient<MediaUploadClient>();
        services.AddHttpClient<RankMathClient>();

        return services;
    }
}
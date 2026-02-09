using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ShopVima.Importers.WordPress.Core.DependencyInjection;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Importers.WordPress.Core.Imports;
using ShopVima.Infrastructure.Persistence;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration(cfg =>
    {
        cfg.AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
        cfg.AddEnvironmentVariables();
    })
    .ConfigureServices((ctx, services) =>
    {
        services.AddDbContext<ShopDbContext>(opt =>
            opt.UseSqlServer(ctx.Configuration.GetConnectionString("Default")));

        var opt = ctx.Configuration.GetSection("Import").Get<WordPressImportOptions>()
                  ?? throw new InvalidOperationException("Missing Import options");

        services.AddWordPressImporter(opt);
    })
    .Build();

using var scope = host.Services.CreateScope();
var orchestrator = scope.ServiceProvider.GetRequiredService<ImportOrchestrator>();

await orchestrator.RunAsync();

Console.WriteLine("✅ Done.");

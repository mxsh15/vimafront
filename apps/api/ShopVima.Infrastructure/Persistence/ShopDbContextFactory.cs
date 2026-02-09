using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ShopVima.Infrastructure.Persistence;

public class ShopDbContextFactory : IDesignTimeDbContextFactory<ShopDbContext>
{
    public ShopDbContext CreateDbContext(string[] args)
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        var basePath = currentDirectory;

        // 1) اگر در همون پوشه‌ای هستیم که appsettings.json دارد
        if (!File.Exists(Path.Combine(basePath, "appsettings.json")))
        {
            // 2) اگر در ریشه سولوشن هستیم و پوشه ShopVimaAPI کنارشه
            var apiPathFromSolutionRoot = Path.Combine(basePath, "ShopVimaAPI");
            if (File.Exists(Path.Combine(apiPathFromSolutionRoot, "appsettings.json")))
            {
                basePath = apiPathFromSolutionRoot;
            }
            else
            {
                // 3) اگر در پروژه Infrastructure هستیم (مثلاً ...\ShopVima.Infrastructure)
                //    یک پوشه بالاتر برو و دنبال ShopVimaAPI بگرد
                var parent = Directory.GetParent(currentDirectory)?.FullName;
                if (parent is not null)
                {
                    var apiPathFromInfrastructure = Path.Combine(parent, "ShopVimaAPI");
                    if (File.Exists(Path.Combine(apiPathFromInfrastructure, "appsettings.json")))
                    {
                        basePath = apiPathFromInfrastructure;
                    }
                }
            }
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            .Build();

        // دقت کن اسم کانکشن دقیقاً با appsettings یکی باشد
        var connectionString = configuration.GetConnectionString("Default");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            // اگر چیزی پیدا نشد، روی یک کانکشن پیش‌فرض برمی‌گردیم
            connectionString =
                "Data Source=localhost;Initial Catalog=ShopVimaDb;Integrated Security=True;TrustServerCertificate=True;";
        }

        var optionsBuilder = new DbContextOptionsBuilder<ShopDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ShopDbContext(optionsBuilder.Options);
    }
}

using System.Security.Claims;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Middleware;

public class AdminAuditMiddleware
{
    private readonly RequestDelegate _next;

    public AdminAuditMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ShopDbContext db)
    {
        var path = context.Request.Path.Value ?? "";
        var isAdminApi = path.StartsWith("/api/admin", StringComparison.OrdinalIgnoreCase);

        if (!isAdminApi)
        {
            await _next(context);
            return;
        }

        var method = context.Request.Method.ToUpperInvariant();

        // فقط Non-GET لاگ میشه (برای اینکه دیتابیس با لیست/ویو پر نشه)
        var shouldLog = method != "GET";

        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            sw.Stop();

            if (shouldLog)
            {
                Guid? userId = null;
                var userIdStr = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdStr, out var uid)) userId = uid;

                var email =
                    context.User?.FindFirst(ClaimTypes.Email)?.Value
                    ?? context.User?.FindFirst("email")?.Value;

                var ip = context.Connection.RemoteIpAddress?.ToString();
                var ua = context.Request.Headers.UserAgent.ToString();

                db.AuditLogs.Add(new AuditLog
                {
                    UserId = userId,
                    UserEmail = email,
                    Method = method,
                    Path = path,
                    QueryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null,
                    StatusCode = context.Response.StatusCode,
                    DurationMs = sw.ElapsedMilliseconds,
                    IpAddress = ip,
                    UserAgent = string.IsNullOrWhiteSpace(ua) ? null : ua,
                    CreatedAtUtc = DateTime.UtcNow
                });

                await db.SaveChangesAsync();
            }
        }
    }
}

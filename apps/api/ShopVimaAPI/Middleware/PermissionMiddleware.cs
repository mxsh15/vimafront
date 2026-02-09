using Microsoft.AspNetCore.Authorization;
using ShopVima.Application.Services;
using System.Security.Claims;

namespace ShopVimaAPI.Middleware;

/// <summary>
/// Middleware برای چک کردن خودکار permissions بر اساس route
/// </summary>
public class PermissionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<PermissionMiddleware> _logger;

    public PermissionMiddleware(RequestDelegate next, ILogger<PermissionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IPermissionService permissionService)
    {
        // فقط برای API routes
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            await _next(context);
            return;
        }

        // Routes که نیاز به permission check ندارند
        var excludedPaths = new[]
        {
            "/api/auth",
            "/api/swagger",
            "/api/health"
        };

        var path = context.Request.Path.Value ?? "";
        var pathLower = path.ToLowerInvariant();
        
        // چک کردن excluded paths (case-insensitive)
        if (excludedPaths.Any(excluded => pathLower.StartsWith(excluded.ToLowerInvariant())))
        {
            await _next(context);
            return;
        }

        // اگر کاربر لاگین نکرده باشد، به next middleware برو
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        // گرفتن UserId
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            await _next(context);
            return;
        }

        // گرفتن method
        var method = context.Request.Method.ToUpperInvariant();

        // پیدا کردن permission مورد نیاز بر اساس route
        var requiredPermission = GetRequiredPermission(path, method);

        // اگر permission مورد نیاز پیدا شد، چک کن
        if (!string.IsNullOrEmpty(requiredPermission))
        {
            var hasPermission = await permissionService.HasPermissionAsync(userId, requiredPermission);

            if (!hasPermission)
            {
                _logger.LogWarning(
                    "User {UserId} attempted to access {Path} with method {Method} but lacks permission {Permission}",
                    userId, path, method, requiredPermission);

                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "شما دسترسی لازم برای انجام این عملیات را ندارید",
                    requiredPermission = requiredPermission
                });
                return;
            }
        }

        await _next(context);
    }

    /// <summary>
    /// پیدا کردن permission مورد نیاز بر اساس route و method
    /// </summary>
    private string? GetRequiredPermission(string path, string method)
    {
        // حذف /api از ابتدای path
        if (path.StartsWith("/api/"))
        {
            path = path.Substring(5);
        }

        // تقسیم path به بخش‌ها
        var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return null;

        var resource = parts[0]; // مثلاً "brands", "products", "users"
        var action = GetActionFromMethod(method, parts);

        // ساخت permission name
        return $"{resource}.{action}";
    }

    /// <summary>
    /// تعیین action بر اساس HTTP method و path
    /// </summary>
    private string GetActionFromMethod(string method, string[] pathParts)
    {
        // اگر path شامل "trash" باشد
        if (pathParts.Any(p => p == "trash"))
        {
            return "trash.view";
        }

        // اگر path شامل "restore" باشد
        if (pathParts.Any(p => p == "restore"))
        {
            return "restore";
        }

        // اگر path شامل "hard" باشد (hard delete)
        if (pathParts.Any(p => p == "hard"))
        {
            return "hardDelete";
        }

        // بر اساس HTTP method
        return method switch
        {
            "GET" => "view",
            "POST" => pathParts.Length > 1 && Guid.TryParse(pathParts[1], out _) ? "update" : "create",
            "PUT" => "update",
            "PATCH" => "update",
            "DELETE" => "delete",
            _ => "view"
        };
    }
}


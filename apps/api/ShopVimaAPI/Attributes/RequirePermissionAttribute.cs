using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ShopVima.Application.Services;
using System.Security.Claims;

namespace ShopVimaAPI.Attributes;

/// <summary>
/// Attribute برای چک کردن دسترسی کاربر به یک permission خاص
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permissionName;

    public RequirePermissionAttribute(string permissionName)
    {
        _permissionName = permissionName;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // اگر کاربر لاگین نکرده باشد
        if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // گرفتن UserId از claims
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // گرفتن PermissionService از DI
        var permissionService = context.HttpContext.RequestServices.GetRequiredService<IPermissionService>();

        // چک کردن دسترسی
        var hasPermission = await permissionService.HasPermissionAsync(userId, _permissionName);

        if (!hasPermission)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}


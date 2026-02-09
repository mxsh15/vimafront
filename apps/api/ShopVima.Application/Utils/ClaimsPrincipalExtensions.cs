using System.Security.Claims;

namespace ShopVima.Application.Utils;

public static class ClaimsPrincipalExtensions
{
    public static bool HasPermission(this ClaimsPrincipal user, string permission)
    {
        return user.Claims.Any(c =>
            c.Type == "permission" && 
            string.Equals(c.Value, permission, StringComparison.OrdinalIgnoreCase));
    }

    public static bool HasAnyPermission(this ClaimsPrincipal user, params string[] permissions)
    {
        foreach (var p in permissions)
        {
            if (user.HasPermission(p))
                return true;
        }
        return false;
    }
}

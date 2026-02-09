using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Attributes;


[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireMultiVendorEnabledAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<ShopDbContext>();

        var s = await db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (s == null) return;

        if (!s.MultiVendorEnabled)
        {
            context.Result = new NotFoundResult();
            return;
        }
    }
}
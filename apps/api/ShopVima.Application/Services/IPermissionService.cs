namespace ShopVima.Application.Services;

public interface IPermissionService
{
    /// <summary>
    /// بررسی می‌کند که آیا کاربر دارای دسترسی مشخص شده است یا نه
    /// </summary>
    Task<bool> HasPermissionAsync(Guid userId, string permissionName);

    /// <summary>
    /// لیست تمام دسترسی‌های کاربر را برمی‌گرداند
    /// </summary>
    Task<List<string>> GetUserPermissionsAsync(Guid userId);

    /// <summary>
    /// بررسی می‌کند که آیا کاربر دارای حداقل یکی از دسترسی‌های مشخص شده است یا نه
    /// </summary>
    Task<bool> HasAnyPermissionAsync(Guid userId, params string[] permissionNames);
}


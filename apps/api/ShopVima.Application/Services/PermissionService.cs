using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Application.Services;

public class PermissionService : IPermissionService
{
    private readonly ShopDbContext _db;

    public PermissionService(ShopDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permissionName)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRole)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

        if (user == null) return false;

        // اگر کاربر Admin باشد (UserRole = Admin)، همه دسترسی‌ها را دارد
        if (user.Role == Domain.Enums.UserRole.Admin)
            return true;

        // بررسی دسترسی‌های نقش کاربر
        if (user.UserRole != null)
        {
            var hasPermission = user.UserRole.RolePermissions
                .Any(rp => rp.Permission.Name == permissionName && !rp.Permission.IsDeleted);

            if (hasPermission) return true;
        }

        return false;
    }

    public async Task<List<string>> GetUserPermissionsAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRole)
                .ThenInclude(r => r!.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

        if (user == null) return new List<string>();

        if (user.Role == UserRole.Admin)
        {
            return await _db.Permissions
                .Where(p => !p.IsDeleted)
                .Select(p => p.Name)
                .ToListAsync();
        }

        if (user.UserRole != null)
        {
            return user.UserRole.RolePermissions
                .Where(rp => !rp.Permission.IsDeleted)
                .Select(rp => rp.Permission.Name)
                .ToList();
        }

        return new List<string>();
    }

    public async Task<bool> HasAnyPermissionAsync(Guid userId, params string[] permissionNames)
    {
        if (permissionNames == null || permissionNames.Length == 0)
            return false;

        var userPermissions = await GetUserPermissionsAsync(userId);
        return permissionNames.Any(p => userPermissions.Contains(p));
    }
}


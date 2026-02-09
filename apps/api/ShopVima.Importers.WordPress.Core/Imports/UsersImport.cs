using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Wp;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Infrastructure.Persistence;
using System.Text.RegularExpressions;
using static System.Net.WebRequestMethods;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class UsersImport
{
    private readonly ShopDbContext _db;
    private readonly WpClient _wp;
    private readonly WordPressImportOptions _opt;
    private readonly ILogger<UsersImport> _log;

    public UsersImport(ShopDbContext db, WpClient wp, WordPressImportOptions opt, ILogger<UsersImport> log)
    {
        _db = db;
        _wp = wp;
        _opt = opt;
        _log = log;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        var roleAdminId = await _db.Roles
            .Where(r => !r.IsDeleted && r.Status && r.Name == "admin")
            .Select(r => r.Id)
            .FirstAsync(ct);

        var roleVendorId = await _db.Roles
            .Where(r => !r.IsDeleted && r.Status && r.Name == "فروشنده")
            .Select(r => r.Id)
            .FirstAsync(ct);

        var roleUserId = await _db.Roles
            .Where(r => !r.IsDeleted && r.Status && r.Name == "کاربر عادی")
            .Select(r => r.Id)
            .FirstAsync(ct);

        var wpUsers = await _wp.GetPagedAsync<WpUserMinimalDto>(
            path: $"{_opt.WpApiPrefix}/users",
            query: new Dictionary<string, string> { ["context"] = "edit" },
            perPage: 100,
            ct: ct
        );

        _log.LogInformation("Sample user: {@User}", wpUsers.FirstOrDefault());

        var created = 0;
        var updated = 0;
        var skippedNoIdentifier = 0;

        var i = 0;

        foreach (var w in wpUsers)
        {
            ct.ThrowIfCancellationRequested();

            var wpUsername = (w.Username ?? "").Trim();
            var wpEmail = (w.Email ?? "").Trim();


            var email = NormalizeEmail(wpEmail);
            if (email is null && IsEmail(wpUsername))
                email = NormalizeEmail(wpUsername);

            string? phone = null;
            if (IsPhoneLike(wpUsername))
                phone = NormalizeIranPhone(wpUsername);

            if (email is null && phone is not null)
            {
                email = $"wp{w.Id}.p{phone}@import.nobelfarm.local".ToLowerInvariant();
            }

            if (email is null && phone is null)
            {
                skippedNoIdentifier++;
                continue;
            }

            var displayName = (w.Name ?? "").Trim();
            var first = (w.FirstName ?? "").Trim();
            var last = (w.LastName ?? "").Trim();

            if (string.IsNullOrWhiteSpace(first) && string.IsNullOrWhiteSpace(last) && !string.IsNullOrWhiteSpace(displayName))
            {
                var parts = displayName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 1) first = parts[0];
                else if (parts.Length >= 2)
                {
                    first = parts[0];
                    last = string.Join(' ', parts.Skip(1));
                }
            }

            var mappedRoleId = MapRoleId(w.Roles, roleAdminId, roleVendorId, roleUserId, out var mappedEnum);


            User? user = null;
            if (email is not null)
            {
                user = await _db.Users.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(x => x.Email != null && x.Email.ToLower() == email, ct);
            }

            if (user is null && phone is not null)
            {
                user = await _db.Users.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(x => x.PhoneNumber != null && x.PhoneNumber == phone, ct);
            }

            if (user is null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    PhoneNumber = phone,
                    //Username = (email is null ? wpUsername : null),
                    DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName,

                    FirstName = string.IsNullOrWhiteSpace(first) ? "—" : first,
                    LastName = string.IsNullOrWhiteSpace(last) ? "—" : last,

                    RoleId = mappedRoleId,
                    Role = mappedEnum,

                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                    Status = true,
                    IsDeleted = false,
                    CreatedAtUtc = DateTime.UtcNow
                };

                _db.Users.Add(user);
                created++;
            }
            else
            {
                // Update only what you want
                if (email is not null) user.Email = email;
                if (phone is not null) user.PhoneNumber = phone;

                if (!string.IsNullOrWhiteSpace(displayName)) user.DisplayName = displayName;
                if (!string.IsNullOrWhiteSpace(first)) user.FirstName = first;
                if (!string.IsNullOrWhiteSpace(last)) user.LastName = last;

                user.RoleId = mappedRoleId;
                user.Role = mappedEnum;

                user.Status = true;
                user.IsDeleted = false;
                user.UpdatedAtUtc = DateTime.UtcNow;

                updated++;
            }

            i++;
            if (i % 200 == 0)
                await _db.SaveChangesAsync(ct);
        }


        await _db.SaveChangesAsync(ct);

        _log.LogInformation("[UsersImport] created={Created} updated={Updated} skippedNoIdentifier={Skipped}",
            created, updated, skippedNoIdentifier);
    }

    private static Guid MapRoleId(
        List<string>? roles,
        Guid roleAdminId,
        Guid roleVendorId,
        Guid roleUserId,
        out UserRole enumRole)
    {
        enumRole = UserRole.Customer;

        if (roles == null || roles.Count == 0)
            return roleUserId;

        var s = string.Join(" ", roles).ToLowerInvariant();

        // مدیر کل / مدیر فروشگاه
        if (s.Contains("administrator") || s.Contains("shop_manager") || s.Contains("مدیر") || s.Contains("manager"))
        {
            enumRole = UserRole.Admin;
            return roleAdminId;
        }

        // فروشنده
        if (s.Contains("vendor") || s.Contains("seller") || s.Contains("dokan") || s.Contains("wcfm") || s.Contains("فروشنده"))
        {
            enumRole = UserRole.Vendor;
            return roleVendorId;
        }

        enumRole = UserRole.Customer;
        return roleUserId;
    }

    private static string? NormalizeEmail(string? email)
    {
        var e = (email ?? "").Trim();
        if (e.Length == 0) return null;
        e = e.ToLowerInvariant();
        return IsEmail(e) ? e : null;
    }

    private static bool IsEmail(string s)
        => Regex.IsMatch(s.Trim(), @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant);

    private static bool IsPhoneLike(string s)
    {
        var x = Regex.Replace(s ?? "", @"\s+|-|\(|\)", "");
        // قبول: 09xxxxxxxxx یا +98xxxxxxxxxx یا 9xxxxxxxxx
        return Regex.IsMatch(x, @"^(?:\+98|0098|0)?9\d{9}$");
    }

    private static string? NormalizeIranPhone(string s)
    {
        var x = Regex.Replace(s ?? "", @"\s+|-|\(|\)", "");
        x = x.Replace("0098", "+98");
        if (x.StartsWith("+98")) x = "0" + x.Substring(3);
        if (x.StartsWith("98")) x = "0" + x.Substring(2);
        if (x.Length == 10 && x.StartsWith("9")) x = "0" + x;
        return Regex.IsMatch(x, @"^09\d{9}$") ? x : null;
    }
}

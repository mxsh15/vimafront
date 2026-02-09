using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Importers.WordPress.Core.Clients;
using ShopVima.Importers.WordPress.Core.Dtos.Dokan;
using ShopVima.Importers.WordPress.Core.Dtos.Wp;
using ShopVima.Importers.WordPress.Core.Options;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class VendorsImport
{
    private readonly ShopDbContext _db;
    private readonly WpClient _wp;
    private readonly WordPressImportOptions _opt;
    private readonly ILogger<VendorsImport> _log;

    public VendorsImport(ShopDbContext db, WpClient wp, WordPressImportOptions opt, ILogger<VendorsImport> log)
    {
        _db = db;
        _wp = wp;
        _opt = opt;
        _log = log;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        // نقش‌ها از DB خودت
        var roleVendorId = await _db.Roles
            .Where(r => !r.IsDeleted && r.Status && r.Name == "فروشنده")
            .Select(r => r.Id)
            .FirstAsync(ct);

        // فروشنده‌ها از دکان
        var stores = await _wp.GetPagedAsync<DokanStoreDto>(
            path: "/wp-json/dokan/v1/stores",
            query: null,
            perPage: 100,
            ct: ct
        );

        // ✅ یک بار کاربران را بگیر (context=edit) و فقط فروشنده‌ها را نگه دار برای fallback
        var wpUsers = await _wp.GetPagedAsync<WpUserVendorDto>(
            path: $"{_opt.WpApiPrefix}/users",
            query: new Dictionary<string, string> { ["context"] = "edit" },
            perPage: 100,
            ct: ct
        );

        var vendorUsersByWpId = wpUsers
            .Where(u => u != null && IsVendorRole(u.Roles))
            .GroupBy(u => u.Id)
            .ToDictionary(g => g.Key, g => g.First());

        var createdUsers = 0;
        var updatedUsers = 0;

        var createdVendors = 0;
        var updatedVendors = 0;

        var createdMembers = 0;
        var createdWallets = 0;

        var skippedNoStoreName = 0;

        var i = 0;

        foreach (var s in stores)
        {
            ct.ThrowIfCancellationRequested();

            var storeName = (s.StoreName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(storeName))
            {
                skippedNoStoreName++;
                continue;
            }

            var first = (s.FirstName ?? "").Trim();
            var last = (s.LastName ?? "").Trim();

            // چون user endpoint دسترسی نمی‌ده/یا ایمیل نمی‌دهد، ایمیل ساختگی یکتا
            var email = $"vendor{s.Id}@import.nobelfarm.local".ToLowerInvariant();

            // -------- fallback user (فقط اگر فروشنده بود) --------
            vendorUsersByWpId.TryGetValue(s.Id, out var u);

            var uUsername = (u?.Username ?? "").Trim();
            var uName = (u?.Name ?? "").Trim();
            var uFirst = (u?.FirstName ?? "").Trim();
            var uLast = (u?.LastName ?? "").Trim();

            var fallbackLegalName =
                !string.IsNullOrWhiteSpace(uName) ? uName :
                (!string.IsNullOrWhiteSpace(uFirst) || !string.IsNullOrWhiteSpace(uLast)) ? $"{uFirst} {uLast}".Trim() :
                storeName;

            // موبایل از username (اگر شماره بود)
            string? fallbackMobile = IsPhoneLike(uUsername) ? NormalizeIranPhone(uUsername) : null;

            // از meta (اگر REST بدهد)
            string? metaNationalId = NormalizeNationalId(TryGetMetaString(u?.Meta,
                "national_id", "nationalId", "melli_code", "national_code",
                "billing_national_id", "dokan_national_id", "dokan_nationalid"));

            string? metaPhone = NormalizeIranPhone(TryGetMetaString(u?.Meta,
                "phone", "billing_phone", "dokan_phone", "store_phone", "telephone"));

            string? metaMobile = NormalizeIranPhone(TryGetMetaString(u?.Meta,
                "mobile", "billing_mobile", "dokan_mobile", "store_mobile", "cellphone", "mobile_number"));

            // اگر موبایل از meta داشت بهتر از username
            fallbackMobile = metaMobile ?? fallbackMobile;

            // -------- 1) Upsert User --------
            var user = await _db.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Email != null && x.Email.ToLower() == email, ct);

            if (user is null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email, // DB تو NOT NULL
                    PhoneNumber = fallbackMobile, // ✅ از users fallback
                    DisplayName = storeName,
                    FirstName = string.IsNullOrWhiteSpace(first) ? (string.IsNullOrWhiteSpace(uFirst) ? "—" : uFirst) : first,
                    LastName = string.IsNullOrWhiteSpace(last) ? (string.IsNullOrWhiteSpace(uLast) ? "—" : uLast) : last,
                    RoleId = roleVendorId,
                    Role = UserRole.Vendor,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                    Status = s.Enabled,
                    IsDeleted = false,
                    CreatedAtUtc = ParseWpDateUtc(s.Registered) ?? DateTime.UtcNow
                };

                _db.Users.Add(user);
                createdUsers++;
            }
            else
            {
                user.DisplayName = storeName;

                // اسم‌ها اگر از دکان نیومد از users پر کن
                if (!string.IsNullOrWhiteSpace(first)) user.FirstName = first;
                else if (!string.IsNullOrWhiteSpace(uFirst)) user.FirstName = uFirst;

                if (!string.IsNullOrWhiteSpace(last)) user.LastName = last;
                else if (!string.IsNullOrWhiteSpace(uLast)) user.LastName = uLast;

                user.RoleId = roleVendorId;
                user.Role = UserRole.Vendor;

                user.Status = s.Enabled;
                user.IsDeleted = false;
                user.UpdatedAtUtc = DateTime.UtcNow;

                // ✅ اگر شماره نداشت، از fallback پر کن
                if (string.IsNullOrWhiteSpace(user.PhoneNumber) && !string.IsNullOrWhiteSpace(fallbackMobile))
                    user.PhoneNumber = fallbackMobile;

                updatedUsers++;
            }

            // -------- 2) Upsert Vendor --------
            var existingMember = await _db.Set<VendorMember>()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(m => !m.IsDeleted && m.UserId == user.Id, ct);

            Vendor vendor;

            if (existingMember?.VendorId != null && existingMember.VendorId != Guid.Empty)
            {
                vendor = await _db.Set<Vendor>()
                    .IgnoreQueryFilters()
                    .FirstAsync(v => v.Id == existingMember.VendorId, ct);

                vendor.StoreName = storeName;
                vendor.DefaultCommissionPercent = ParseCommissionPercent(s.AdminCommissionType, s.AdminCommission);

                // ✅ فیلدهای درخواستی: اگر خالی بود از users fallback
                vendor.LegalName ??= fallbackLegalName;
                vendor.NationalId ??= metaNationalId;
                vendor.PhoneNumber ??= metaPhone;
                vendor.MobileNumber ??= fallbackMobile;

                vendor.UpdatedAtUtc = DateTime.UtcNow;
                updatedVendors++;
            }
            else
            {
                vendor = new Vendor
                {
                    Id = Guid.NewGuid(),
                    StoreName = storeName,
                    DefaultCommissionPercent = ParseCommissionPercent(s.AdminCommissionType, s.AdminCommission),

                    // ✅ فیلدهای درخواستی
                    LegalName = fallbackLegalName,
                    NationalId = metaNationalId,
                    PhoneNumber = metaPhone,
                    MobileNumber = fallbackMobile,

                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false,
                    Status = true
                };

                _db.Set<Vendor>().Add(vendor);
                createdVendors++;
            }

            // -------- 3) Upsert VendorMember (Owner) --------
            if (existingMember is null)
            {
                var member = new VendorMember
                {
                    Id = Guid.NewGuid(),
                    VendorId = vendor.Id,
                    UserId = user.Id,
                    Role = "Owner",
                    IsActive = s.Enabled,
                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false,
                    Status = true
                };

                _db.Set<VendorMember>().Add(member);
                createdMembers++;
            }
            else
            {
                existingMember.VendorId = vendor.Id;
                existingMember.Role = "Owner";
                existingMember.IsActive = s.Enabled;
                existingMember.IsDeleted = false;
                existingMember.UpdatedAtUtc = DateTime.UtcNow;
            }

            // -------- 4) Upsert VendorWallet --------
            var walletExists = await _db.Set<VendorWallet>()
                .IgnoreQueryFilters()
                .AnyAsync(w => !w.IsDeleted && w.VendorId == vendor.Id, ct);

            if (!walletExists)
            {
                _db.Set<VendorWallet>().Add(new VendorWallet
                {
                    Id = Guid.NewGuid(),
                    VendorId = vendor.Id,
                    Balance = 0,
                    PendingBalance = 0,
                    TotalEarnings = 0,
                    TotalWithdrawn = 0,
                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false,
                    Status = true
                });
                createdWallets++;
            }

            // -------- Batch Save --------
            i++;
            if (i % 200 == 0)
                await _db.SaveChangesAsync(ct);
        }

        await _db.SaveChangesAsync(ct);

        _log.LogInformation(
            "[VendorsImport] users: created={CreatedUsers} updated={UpdatedUsers} | vendors: created={CreatedVendors} updated={UpdatedVendors} | membersCreated={Members} walletsCreated={Wallets} skippedNoStoreName={Skipped}",
            createdUsers, updatedUsers, createdVendors, updatedVendors, createdMembers, createdWallets, skippedNoStoreName
        );
    }

    private static decimal? ParseCommissionPercent(string? type, string? value)
    {
        if (!string.Equals(type, "percentage", StringComparison.OrdinalIgnoreCase))
            return null;

        var s = (value ?? "").Trim();
        if (s.Length == 0) return null;

        if (decimal.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
            return d;

        s = s.Replace(',', '.');
        if (decimal.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out d))
            return d;

        return null;
    }

    private static DateTime? ParseWpDateUtc(string? wpDate)
    {
        if (string.IsNullOrWhiteSpace(wpDate)) return null;

        if (DateTime.TryParseExact(
                wpDate.Trim(),
                "yyyy-MM-dd HH:mm:ss",
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var dt))
            return dt;

        return null;
    }

    // -------------------- Helpers --------------------

    private static bool IsVendorRole(List<string>? roles)
    {
        if (roles == null || roles.Count == 0) return false;
        var s = string.Join(" ", roles).ToLowerInvariant();
        return s.Contains("vendor") || s.Contains("seller") || s.Contains("dokan") || s.Contains("wcfm") || s.Contains("store");
    }

    private static bool IsPhoneLike(string s)
    {
        var x = Regex.Replace(s ?? "", @"\s+|-|\(|\)", "");
        return Regex.IsMatch(x, @"^(?:\+98|0098|0)?9\d{9}$");
    }

    private static string? NormalizeIranPhone(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;

        var x = Regex.Replace(s, @"\s+|-|\(|\)", "");
        x = x.Replace("0098", "+98");
        if (x.StartsWith("+98")) x = "0" + x.Substring(3);
        if (x.StartsWith("98")) x = "0" + x.Substring(2);
        if (x.Length == 10 && x.StartsWith("9")) x = "0" + x;
        return Regex.IsMatch(x, @"^09\d{9}$") ? x : null;
    }

    private static string? NormalizeNationalId(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        var x = Regex.Replace(s, @"\D", "");
        return x.Length == 10 ? x : null;
    }

    private static string? TryGetMetaString(JsonElement? meta, params string[] keys)
    {
        if (meta is null) return null;

        var m = meta.Value;
        if (m.ValueKind != JsonValueKind.Object) return null;

        foreach (var k in keys)
        {
            if (m.TryGetProperty(k, out var v))
            {
                if (v.ValueKind == JsonValueKind.String)
                {
                    var s = v.GetString();
                    if (!string.IsNullOrWhiteSpace(s)) return s.Trim();
                }
                else
                {
                    var raw = v.ToString();
                    if (!string.IsNullOrWhiteSpace(raw)) return raw.Trim();
                }
            }
        }

        return null;
    }
}

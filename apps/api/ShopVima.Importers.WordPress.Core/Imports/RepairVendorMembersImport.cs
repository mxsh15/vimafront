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
using ShopVima.Importers.WordPress.Core.Services;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class RepairVendorMembersImport
{
    private readonly ShopDbContext _db;
    private readonly WpClient _wp;
    private readonly WordPressImportOptions _opt;
    private readonly ExternalMapService _map;
    private readonly ILogger<RepairVendorMembersImport> _log;

    public RepairVendorMembersImport(
        ShopDbContext db,
        WpClient wp,
        WordPressImportOptions opt,
        ExternalMapService map,
        ILogger<RepairVendorMembersImport> log)
    {
        _db = db;
        _wp = wp;
        _opt = opt;
        _map = map;
        _log = log;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        // نقش فروشنده در DB خودت
        var roleVendorId = await _db.Roles
            .Where(r => !r.IsDeleted && r.Status && r.Name == "فروشنده")
            .Select(r => r.Id)
            .FirstAsync(ct);

        // Stores از Dokan
        var stores = await _wp.GetPagedAsync<DokanStoreDto>(
            path: "/wp-json/dokan/v1/stores",
            query: null,
            perPage: 100,
            ct: ct
        );

        // Users از WP (context=edit) برای گرفتن email/meta
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

        var linked = 0;
        var createdMembers = 0;
        var createdVendors = 0;
        var updatedVendors = 0;
        var updatedUsers = 0;
        var skippedNoUserMatch = 0;

        var i = 0;

        foreach (var s in stores)
        {
            ct.ThrowIfCancellationRequested();

            var storeName = (s.StoreName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(storeName))
                continue;

            vendorUsersByWpId.TryGetValue(s.Id, out var wpUser);

            // 1) پیدا کردن User موجود در DB (اولویت: email واقعی، بعد phone)
            var user = await FindBestExistingUserAsync(wpUser, s, ct);

            if (user == null)
            {
                skippedNoUserMatch++;
                continue;
            }

            // 2) مطمئن شو نقش کاربر Vendor است
            if (user.Role != UserRole.Vendor || user.RoleId != roleVendorId)
            {
                user.Role = UserRole.Vendor;
                user.RoleId = roleVendorId;
                user.UpdatedAtUtc = DateTime.UtcNow;
                updatedUsers++;
            }

            // 3) VendorId را از ExternalIdMap بگیر تا پایدار باشد
            var vendorId = await _map.GetOrCreateInternalIdAsync(
                provider: _opt.Provider,
                type: "Vendor",
                externalId: s.Id.ToString(CultureInfo.InvariantCulture),
                slug: storeName,
                ct: ct
            );

            // 4) Upsert Vendor
            var vendor = await _db.Vendors.IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == vendorId, ct);

            var commission = ParseCommissionPercent(s.AdminCommissionType, s.AdminCommission);

            var first = (s.FirstName ?? "").Trim();
            var last = (s.LastName ?? "").Trim();
            var legalNameFallback =
                !string.IsNullOrWhiteSpace(wpUser?.Name) ? wpUser!.Name!.Trim() :
                (!string.IsNullOrWhiteSpace(first) || !string.IsNullOrWhiteSpace(last)) ? $"{first} {last}".Trim() :
                storeName;

            var metaNationalId = NormalizeNationalId(TryGetMetaString(wpUser?.Meta,
                "national_id", "nationalId", "melli_code", "national_code",
                "billing_national_id", "dokan_national_id", "dokan_nationalid"));

            var metaPhone = NormalizeIranPhone(TryGetMetaString(wpUser?.Meta,
                "phone", "billing_phone", "dokan_phone", "store_phone", "telephone"));

            var metaMobile = NormalizeIranPhone(TryGetMetaString(wpUser?.Meta,
                "mobile", "billing_mobile", "dokan_mobile", "store_mobile", "cellphone", "mobile_number"));

            if (vendor == null)
            {
                vendor = new Vendor
                {
                    Id = vendorId,
                    StoreName = storeName,
                    DefaultCommissionPercent = commission,
                    LegalName = legalNameFallback,
                    NationalId = metaNationalId,
                    PhoneNumber = metaPhone,
                    MobileNumber = metaMobile,
                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false,
                    Status = true
                };

                _db.Vendors.Add(vendor);
                createdVendors++;
            }
            else
            {
                vendor.StoreName = storeName;
                vendor.DefaultCommissionPercent = commission;

                vendor.LegalName ??= legalNameFallback;
                vendor.NationalId ??= metaNationalId;
                vendor.PhoneNumber ??= metaPhone;
                vendor.MobileNumber ??= metaMobile;

                vendor.IsDeleted = false;
                vendor.UpdatedAtUtc = DateTime.UtcNow;
                updatedVendors++;
            }

            // 5) Upsert VendorMember (Owner)
            // اگر همین کاربر قبلاً عضویت دارد، همون رو به Vendor صحیح وصل کن
            var member = await _db.VendorMembers.IgnoreQueryFilters()
                .FirstOrDefaultAsync(m => !m.IsDeleted && m.UserId == user.Id, ct);

            if (member == null)
            {
                // اگر Vendor قبلاً Owner دارد، دوباره Owner نساز. اینجا فقط اگر نبود می‌سازیم.
                var vendorHasOwner = await _db.VendorMembers.IgnoreQueryFilters()
                    .AnyAsync(m => !m.IsDeleted && m.VendorId == vendorId && m.Role == "Owner", ct);

                if (!vendorHasOwner)
                {
                    _db.VendorMembers.Add(new VendorMember
                    {
                        Id = Guid.NewGuid(),
                        VendorId = vendorId,
                        UserId = user.Id,
                        Role = "Owner",
                        IsActive = s.Enabled,
                        CreatedAtUtc = DateTime.UtcNow,
                        IsDeleted = false,
                        Status = true
                    });

                    createdMembers++;
                }
            }
            else
            {
                member.VendorId = vendorId;
                member.Role = "Owner";
                member.IsActive = s.Enabled;
                member.IsDeleted = false;
                member.UpdatedAtUtc = DateTime.UtcNow;
            }

            linked++;
            i++;
            if (i % 200 == 0)
                await _db.SaveChangesAsync(ct);
        }

        await _db.SaveChangesAsync(ct);

        _log.LogInformation(
            "[RepairVendorMembersImport] linked={Linked} vendors: created={CreatedVendors} updated={UpdatedVendors} | membersCreated={CreatedMembers} | usersUpdated={UsersUpdated} | skippedNoUserMatch={Skipped}",
            linked, createdVendors, updatedVendors, createdMembers, updatedUsers, skippedNoUserMatch
        );
    }

    private async Task<User?> FindBestExistingUserAsync(WpUserVendorDto? wpUser, DokanStoreDto store, CancellationToken ct)
    {
        // اولویت 1: ایمیل واقعی WP
        var email = NormalizeEmail(wpUser?.Email);
        if (!string.IsNullOrWhiteSpace(email))
        {
            var byEmail = await _db.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email, ct);

            if (byEmail != null) return byEmail;
        }

        // اولویت 2: موبایل از meta یا username
        var phone =
            NormalizeIranPhone(TryGetMetaString(wpUser?.Meta, "mobile", "billing_mobile", "dokan_mobile", "store_mobile")) ??
            (IsPhoneLike(wpUser?.Username ?? "") ? NormalizeIranPhone(wpUser!.Username) : null);

        if (!string.IsNullOrWhiteSpace(phone))
        {
            var byPhone = await _db.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.PhoneNumber != null && u.PhoneNumber == phone, ct);

            if (byPhone != null) return byPhone;
        }

        // اولویت 3: اگر قبلاً VendorsImport ساخته، الگوی ایمیل ساختگی
        var synthetic = $"vendor{store.Id}@import.nobelfarm.local".ToLowerInvariant();
        var bySynthetic = await _db.Users.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == synthetic, ct);

        return bySynthetic;
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

    private static bool IsVendorRole(List<string>? roles)
    {
        if (roles == null || roles.Count == 0) return false;
        var s = string.Join(" ", roles).ToLowerInvariant();
        return s.Contains("vendor") || s.Contains("seller") || s.Contains("dokan") || s.Contains("wcfm") || s.Contains("store");
    }

    private static string? NormalizeEmail(string? email)
    {
        var e = (email ?? "").Trim();
        if (e.Length == 0) return null;
        e = e.ToLowerInvariant();
        return Regex.IsMatch(e, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant) ? e : null;
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

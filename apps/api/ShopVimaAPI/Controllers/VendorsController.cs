using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Vendor;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/vendors")]
//[RequireMultiVendorEnabled]
[Authorize]
public class VendorsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public VendorsController(ShopDbContext db) => _db = db;

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var id) ? id : Guid.Empty;
    }

    [HttpGet]
    [RequirePermission("vendors.view")]
    public async Task<ActionResult<PagedResult<VendorListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] string? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var settings = await _db.StoreSettings
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (settings != null && !settings.MultiVendorEnabled)
        {
            if (!settings.StoreVendorId.HasValue || settings.StoreVendorId.Value == Guid.Empty)
            {
                return Ok(new PagedResult<VendorListItemDto>(new List<VendorListItemDto>(), 0, page, pageSize));
            }

            var items = await _db.Vendors
                .AsNoTracking()
                .Where(v => !v.IsDeleted && v.Id == settings.StoreVendorId.Value)
                .Select(v => new VendorListItemDto(
                    v.Id,
                    v.StoreName,
                    v.LegalName,
                    v.NationalId,
                    v.PhoneNumber,
                    v.MobileNumber,
                    v.DefaultCommissionPercent,
                    v.Members.Where(m => m.Role == "Owner" && m.IsActive).Select(m => (Guid?)m.UserId).FirstOrDefault(),
                    v.Members.Where(m => m.Role == "Owner" && m.IsActive).Select(m => m.User.FullName).FirstOrDefault(),
                    v.OwnedProducts.Count,
                    0,
                    0,
                    v.Status,
                    v.CreatedAtUtc
                ))
                .ToListAsync();

            return Ok(new PagedResult<VendorListItemDto>(items, items.Count, page, pageSize));
        }


        var query = _db.Vendors
            .AsNoTracking()
            .Where(v => !v.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(v => v.StoreName.Contains(s) ||
                (v.LegalName != null && v.LegalName.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "active")
                query = query.Where(v => v.Status);
            else if (status == "inactive")
                query = query.Where(v => !v.Status);
        }

        var total = await query.LongCountAsync();

        var vendorIds = await query
            .OrderByDescending(v => v.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => v.Id)
            .ToListAsync();

        var resultItems = await _db.Vendors
            .AsNoTracking()
            .Where(v => vendorIds.Contains(v.Id))
            .Select(v => new VendorListItemDto(
                v.Id,
                v.StoreName,
                v.LegalName,
                v.NationalId,
                v.PhoneNumber,
                v.MobileNumber,
                v.DefaultCommissionPercent,
                v.Members.Where(m => m.Role == "Owner" && m.IsActive).Select(m => (Guid?)m.UserId).FirstOrDefault(),
                v.Members.Where(m => m.Role == "Owner" && m.IsActive).Select(m => m.User.FullName).FirstOrDefault(),
                v.OwnedProducts.Count,
                0,
                0,
                v.Status,
                v.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<VendorListItemDto>(resultItems, (int)total, page, pageSize));
    }


    [HttpGet("{id:guid}")]
    [RequirePermission("vendors.view")]
    public async Task<ActionResult<VendorDto>> Get(Guid id)
    {
        var vendor = await _db.Vendors
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null) return NotFound();

        var ownerMember = await _db.VendorMembers
            .Include(vm => vm.User)
            .Where(vm => vm.VendorId == id && vm.Role == "Owner" && vm.IsActive)
            .Select(vm => new { vm.UserId, vm.User.FullName })
            .FirstOrDefaultAsync();

        return Ok(new VendorDto(
            vendor.Id,
            vendor.StoreName,
            vendor.LegalName,
            vendor.NationalId,
            vendor.PhoneNumber,
            vendor.MobileNumber,
            vendor.DefaultCommissionPercent,
            ownerMember != null ? ownerMember.UserId : (Guid?)null,
            ownerMember?.FullName,
            vendor.CreatedAtUtc,
            vendor.Status
        ));
    }

    [HttpPost]
    [RequirePermission("vendors.create")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult<VendorDto>> Create([FromBody] VendorCreateDto dto)
    {
        var vendor = new Vendor
        {
            StoreName = dto.StoreName,
            LegalName = dto.LegalName,
            NationalId = dto.NationalId,
            PhoneNumber = dto.PhoneNumber,
            MobileNumber = dto.MobileNumber,
            DefaultCommissionPercent = dto.DefaultCommissionPercent,
            Status = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync();


        var currentUserId = GetCurrentUserId();
        if (currentUserId != Guid.Empty)
        {
            _db.VendorMembers.Add(new VendorMember
            {
                VendorId = vendor.Id,
                UserId = currentUserId,
                Role = "Owner",
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        var ownerMemberInfo = dto.OwnerUserId.HasValue
            ? await _db.Users
                .Where(u => u.Id == dto.OwnerUserId.Value)
                .Select(u => u.FullName)
                .FirstOrDefaultAsync()
            : null;

        return CreatedAtAction(nameof(Get), new { id = vendor.Id }, new VendorDto(
            vendor.Id,
            vendor.StoreName,
            vendor.LegalName,
            vendor.NationalId,
            vendor.PhoneNumber,
            vendor.MobileNumber,
            vendor.DefaultCommissionPercent,
            dto.OwnerUserId,
            ownerMemberInfo,
            vendor.CreatedAtUtc,
            vendor.Status
        ));
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("vendors.update")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult<VendorDto>> Update(Guid id, [FromBody] VendorUpdateDto dto)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.Id == id);
        if (vendor == null) return NotFound();

        vendor.StoreName = dto.StoreName;
        vendor.LegalName = dto.LegalName;
        vendor.NationalId = dto.NationalId;
        vendor.PhoneNumber = dto.PhoneNumber;
        vendor.MobileNumber = dto.MobileNumber;
        vendor.DefaultCommissionPercent = dto.DefaultCommissionPercent;
        vendor.Status = dto.Status;
        vendor.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var ownerMember = await _db.VendorMembers
            .Include(vm => vm.User)
            .Where(vm => vm.VendorId == id && vm.Role == "Owner" && vm.IsActive)
            .Select(vm => new { vm.UserId, vm.User.FullName })
            .FirstOrDefaultAsync();

        return Ok(new VendorDto(
            vendor.Id,
            vendor.StoreName,
            vendor.LegalName,
            vendor.NationalId,
            vendor.PhoneNumber,
            vendor.MobileNumber,
            vendor.DefaultCommissionPercent,
            ownerMember != null ? ownerMember.UserId : (Guid?)null,
            ownerMember?.FullName,
            vendor.CreatedAtUtc,
            vendor.Status
        ));
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("vendors.delete")]
    [RequireMultiVendorEnabled]
    public async Task<IActionResult> Delete(Guid id)
    {
        var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.Id == id);
        if (vendor == null) return NotFound();

        vendor.IsDeleted = true;
        vendor.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("trash")]
    [RequirePermission("vendors.trash.view")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult<PagedResult<VendorListItemDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Vendors
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(v => v.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(v => v.StoreName.Contains(s) ||
                (v.LegalName != null && v.LegalName.Contains(s)));
        }

        var total = await query.LongCountAsync();
        var vendorIds = await query
            .OrderByDescending(v => v.DeletedAtUtc ?? v.UpdatedAtUtc ?? v.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => v.Id)
            .ToListAsync();

        var items = await _db.Vendors
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(v => vendorIds.Contains(v.Id))
            .Select(v => new VendorListItemDto(
                v.Id,
                v.StoreName,
                v.LegalName,
                v.NationalId,
                v.PhoneNumber,
                v.MobileNumber,
                v.DefaultCommissionPercent,
                v.Members
                    .Where(m => m.Role == "Owner" && m.IsActive)
                    .Select(m => (Guid?)m.UserId)
                    .FirstOrDefault(),
                v.Members
                    .Where(m => m.Role == "Owner" && m.IsActive)
                    .Select(m => m.User.FullName)
                    .FirstOrDefault(),
                v.OwnedProducts.Count,
                0,                 // Orders count
                0,                 // Total sales
                v.Status,
                v.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<VendorListItemDto>(items, page, pageSize, (int)total));
    }

    [HttpPost("{id:guid}/restore")]
    [RequirePermission("vendors.restore")]
    [RequireMultiVendorEnabled]
    public async Task<IActionResult> Restore(Guid id)
    {
        var vendor = await _db.Vendors
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null) return NotFound();
        if (!vendor.IsDeleted) return BadRequest("این فروشنده حذف نشده است");

        vendor.IsDeleted = false;
        vendor.DeletedAtUtc = null;
        vendor.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("vendors.hardDelete")]
    [RequireMultiVendorEnabled]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var vendor = await _db.Vendors
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null) return NotFound();

        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("{id:guid}/members")]
    [Authorize]
    [RequirePermission("vendors.manageMembers")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult<List<VendorMemberDto>>> GetMembers(Guid id)
    {
        var members = await _db.VendorMembers
            .Include(vm => vm.User)
            .Where(vm => vm.VendorId == id)
            .Select(vm => new VendorMemberDto(
                vm.VendorId,
                vm.UserId,
                vm.User.Email,
                vm.User.FullName,
                vm.Role,
                vm.IsActive
            ))
            .ToListAsync();

        return Ok(members);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<List<VendorListItemDto>>> GetMyVendors()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var vendors = await _db.VendorMembers
            .Where(vm => vm.UserId == userId && vm.IsActive)
            .Select(vm => vm.Vendor)
            .OrderBy(v => v.StoreName)
            .Select(v => new VendorListItemDto(
                    v.Id,
                    v.StoreName,
                    v.LegalName,
                    v.NationalId,
                    v.PhoneNumber,
                    v.MobileNumber,
                    v.DefaultCommissionPercent,
                    v.Members
                        .Where(m => m.Role == "Owner" && m.IsActive)
                        .Select(m => (Guid?)m.UserId)
                        .FirstOrDefault(),
                    v.Members
                        .Where(m => m.Role == "Owner" && m.IsActive)
                        .Select(m => m.User.FullName)
                        .FirstOrDefault(),
                    v.OwnedProducts.Count,
                    0,                 // Orders count
                    null,              // Total sales (اگر نمی‌دونی، null بهتر از 0 فیکه)
                    v.Status,
                    v.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(vendors);
    }


    [HttpPost("{id:guid}/members")]
    [Authorize]
    [RequirePermission("vendors.manageMembers")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult> AddMember(Guid id, [FromBody] AddVendorMemberRequest dto)
    {
        var vendorExists = await _db.Vendors.AnyAsync(v => v.Id == id);
        if (!vendorExists) return NotFound("Vendor not found.");

        var exists = await _db.VendorMembers
            .AnyAsync(vm => vm.VendorId == id && vm.UserId == dto.UserId);
        if (exists)
            return BadRequest("این کاربر قبلاً عضو این فروشنده است.");

        var vm = new VendorMember
        {
            VendorId = id,
            UserId = dto.UserId,
            Role = dto.Role,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.VendorMembers.Add(vm);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpDelete("{vendorId:guid}/members/{userId:guid}")]
    [Authorize]
    [RequirePermission("vendors.manageMembers")]
    [RequireMultiVendorEnabled]
    public async Task<ActionResult> RemoveMember(Guid vendorId, Guid userId)
    {
        var member = await _db.VendorMembers
            .FirstOrDefaultAsync(vm => vm.VendorId == vendorId && vm.UserId == userId);

        if (member == null) return NotFound();

        _db.VendorMembers.Remove(member);
        await _db.SaveChangesAsync();

        return NoContent();
    }

}


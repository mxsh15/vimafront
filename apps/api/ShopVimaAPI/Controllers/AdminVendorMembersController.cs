using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.VendorMember;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/admin/vendors/{vendorId:guid}/members")]
[RequireMultiVendorEnabled]
[Authorize]
public class AdminVendorMembersController : ControllerBase
{
    private readonly ShopDbContext _db;

    public AdminVendorMembersController(ShopDbContext db)
    {
        _db = db;
    }

    // GET: /api/admin/vendors/{vendorId}/members?page=1&pageSize=12&q=&isActive=true&role=
    [HttpGet]
    [RequirePermission("vendor_members.view")]
    public async Task<ActionResult<PagedResult<VendorMemberListItemDto>>> List(
        Guid vendorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? q = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? role = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 200) pageSize = 12;

        var vendorExists = await _db.Vendors
            .AsNoTracking()
            .AnyAsync(v => v.Id == vendorId && !v.IsDeleted);

        if (!vendorExists)
            return NotFound("Vendor not found.");

        var query = _db.VendorMembers
            .AsNoTracking()
            .Include(vm => vm.User)
            .Where(vm =>
                vm.VendorId == vendorId &&
                !vm.IsDeleted
            );

        if (isActive.HasValue)
            query = query.Where(vm => vm.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(role))
        {
            var r = role.Trim();
            query = query.Where(vm => vm.Role == r);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(vm =>
                vm.User.Email.Contains(s) ||
                (vm.User.FirstName + " " + vm.User.LastName).Contains(s) ||
                vm.Role.Contains(s)
            );
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(vm => vm.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(vm => new VendorMemberListItemDto(
                vm.Id,
                vm.VendorId,
                vm.UserId,
                vm.User.FirstName + " " + vm.User.LastName,
                vm.User.Email,
                vm.Role,
                vm.IsActive,
                vm.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<VendorMemberListItemDto>(
            items,
            totalCount,
            page,
            pageSize
        ));
    }

    // POST: /api/admin/vendors/{vendorId}/members
    [HttpPost]
    [RequirePermission("vendor_members.create")]
    public async Task<IActionResult> Add(
        Guid vendorId,
        [FromBody] AddVendorMemberDto dto
    )
    {
        if (dto.UserId == Guid.Empty)
            return BadRequest("UserId is required.");

        if (string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest("Role is required.");

        var vendor = await _db.Vendors
            .FirstOrDefaultAsync(v => v.Id == vendorId && !v.IsDeleted);

        if (vendor == null)
            return NotFound("Vendor not found.");

        var userExists = await _db.Users
            .AnyAsync(u => u.Id == dto.UserId && !u.IsDeleted);

        if (!userExists)
            return NotFound("User not found.");

        var existing = await _db.VendorMembers
            .FirstOrDefaultAsync(vm =>
                vm.VendorId == vendorId &&
                vm.UserId == dto.UserId
            );

        if (existing != null)
        {
            if (!existing.IsDeleted)
                return Conflict("User is already a member of this vendor.");

            // revive soft-deleted member
            existing.IsDeleted = false;
            existing.DeletedAtUtc = null;
            existing.Role = dto.Role.Trim();
            existing.IsActive = dto.IsActive;
            existing.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(new { id = existing.Id, revived = true });
        }

        var now = DateTime.UtcNow;

        var member = new VendorMember
        {
            VendorId = vendorId,
            UserId = dto.UserId,
            Role = dto.Role.Trim(),
            IsActive = dto.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        _db.VendorMembers.Add(member);
        await _db.SaveChangesAsync();

        return Ok(new { id = member.Id });
    }

    // PUT: /api/admin/vendors/{vendorId}/members/{memberId}
    [HttpPut("{memberId:guid}")]
    [RequirePermission("vendor_members.update")]
    public async Task<IActionResult> Update(
        Guid vendorId,
        Guid memberId,
        [FromBody] UpdateVendorMemberDto dto
    )
    {
        if (string.IsNullOrWhiteSpace(dto.Role))
            return BadRequest("Role is required.");

        var member = await _db.VendorMembers
            .FirstOrDefaultAsync(vm =>
                vm.Id == memberId &&
                vm.VendorId == vendorId &&
                !vm.IsDeleted
            );

        if (member == null)
            return NotFound();

        member.Role = dto.Role.Trim();
        member.IsActive = dto.IsActive;
        member.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/admin/vendors/{vendorId}/members/{memberId}
    [HttpDelete("{memberId:guid}")]
    [RequirePermission("vendor_members.delete")]
    public async Task<IActionResult> Remove(
        Guid vendorId,
        Guid memberId
    )
    {
        var member = await _db.VendorMembers
            .FirstOrDefaultAsync(vm =>
                vm.Id == memberId &&
                vm.VendorId == vendorId &&
                !vm.IsDeleted
            );

        if (member == null)
            return NotFound();

        member.IsDeleted = true;
        member.DeletedAtUtc = DateTime.UtcNow;
        member.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}

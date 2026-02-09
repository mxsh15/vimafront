using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.VendorFinance;
using ShopVima.Application.Services;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/vendorFinance")]
[RequireMultiVendorEnabled]
[Authorize]
public class VendorFinanceController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IPermissionService _permissionService;

    public VendorFinanceController(ShopDbContext db, IPermissionService permissionService)
    {
        _db = db;
        _permissionService = permissionService;
    }


    [HttpGet("wallets")]
    [RequirePermission("vendorFinance.wallets.view")]
    public async Task<ActionResult<PagedResult<AdminVendorWalletListItemDto>>> ListWallets(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorWallets
            .AsNoTracking()
            .Include(w => w.Vendor)
            .Where(w => !w.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(w =>
                w.Vendor.StoreName.Contains(s) ||
                w.VendorId.ToString().Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(w => w.UpdatedAtUtc ?? w.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new AdminVendorWalletListItemDto(
                w.VendorId,
                w.Vendor.StoreName,
                w.Balance,
                w.PendingBalance,
                w.TotalEarnings,
                w.TotalWithdrawn,
                w.CreatedAtUtc,
                w.UpdatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorWalletListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("wallets/{vendorId:guid}")]
    [RequirePermission("vendorFinance.wallets.view")]
    public async Task<ActionResult<object>> GetWallet(Guid vendorId, [FromQuery] int txTake = 50)
    {
        if (txTake <= 0 || txTake > 200) txTake = 50;

        var wallet = await _db.VendorWallets
            .AsNoTracking()
            .Include(w => w.Vendor)
            .FirstOrDefaultAsync(w => w.VendorId == vendorId && !w.IsDeleted);

        if (wallet == null) return NotFound();

        var tx = await _db.VendorTransactions
            .AsNoTracking()
            .Where(t => t.VendorWalletId == wallet.Id && !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAtUtc)
            .Take(txTake)
            .Select(t => new AdminVendorTransactionListItemDto(
                t.Id,
                wallet.VendorId,
                wallet.Vendor.StoreName,
                t.Type,
                t.Amount,
                t.BalanceAfter,
                t.OrderId,
                t.Description,
                t.ReferenceNumber,
                t.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new
        {
            wallet = new AdminVendorWalletListItemDto(
                wallet.VendorId,
                wallet.Vendor.StoreName,
                wallet.Balance,
                wallet.PendingBalance,
                wallet.TotalEarnings,
                wallet.TotalWithdrawn,
                wallet.CreatedAtUtc,
                wallet.UpdatedAtUtc
            ),
            transactions = tx
        });
    }


    [HttpPost("wallets/{vendorId:guid}/adjust")]
    [RequirePermission("vendorFinance.wallets.adjust")]
    public async Task<IActionResult> AdjustWallet(Guid vendorId, [FromBody] AdminWalletAdjustmentDto dto)
    {
        if (dto.Amount == 0) return BadRequest("Amount نباید صفر باشد.");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var has = await _permissionService.HasPermissionAsync(userId, "vendorFinance.wallets.adjust");
        if (!has) return Forbid();

        var wallet = await _db.VendorWallets
            .Include(w => w.Vendor)
            .FirstOrDefaultAsync(w => w.VendorId == vendorId && !w.IsDeleted);

        if (wallet == null) return NotFound("Wallet not found.");

        // مقدار مثبت: افزایش Balance
        // مقدار منفی: کاهش Balance (اگر کافی نبود خطا)
        if (dto.Amount < 0 && wallet.Balance + dto.Amount < 0)
            return BadRequest("موجودی قابل برداشت کافی نیست.");

        wallet.Balance += dto.Amount;
        wallet.UpdatedAtUtc = DateTime.UtcNow;

        var tx = new VendorTransaction
        {
            VendorWalletId = wallet.Id,
            Type = TransactionType.Adjustment,
            Amount = dto.Amount,
            BalanceAfter = wallet.Balance,
            Description = dto.Description,
            ReferenceNumber = dto.ReferenceNumber,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.VendorTransactions.Add(tx);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("transactions")]
    [RequirePermission("vendorFinance.transactions.view")]
    public async Task<ActionResult<PagedResult<AdminVendorTransactionListItemDto>>> ListTransactions(
        [FromQuery] Guid? vendorId = null,
        [FromQuery] TransactionType? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorTransactions
            .AsNoTracking()
            .Include(t => t.Wallet).ThenInclude(w => w.Vendor)
            .Where(t => !t.IsDeleted);

        if (vendorId.HasValue && vendorId.Value != Guid.Empty)
            query = query.Where(t => t.Wallet.VendorId == vendorId.Value);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(t =>
                (t.Description != null && t.Description.Contains(s)) ||
                (t.ReferenceNumber != null && t.ReferenceNumber.Contains(s)) ||
                (t.OrderId != null && t.OrderId.ToString()!.Contains(s)) ||
                t.Wallet.Vendor.StoreName.Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new AdminVendorTransactionListItemDto(
                t.Id,
                t.Wallet.VendorId,
                t.Wallet.Vendor.StoreName,
                t.Type,
                t.Amount,
                t.BalanceAfter,
                t.OrderId,
                t.Description,
                t.ReferenceNumber,
                t.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorTransactionListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("payouts")]
    [RequirePermission("vendorFinance.payouts.view")]
    public async Task<ActionResult<PagedResult<AdminVendorPayoutListItemDto>>> ListPayouts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] PayoutStatus? status = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorPayouts
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Where(p => !p.IsDeleted);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p =>
                p.Vendor.StoreName.Contains(s) ||
                (p.ShabaNumber != null && p.ShabaNumber.Contains(s)) ||
                (p.AccountNumber != null && p.AccountNumber.Contains(s)) ||
                p.VendorId.ToString().Contains(s)
            );
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminVendorPayoutListItemDto(
                p.Id,
                p.VendorId,
                p.Vendor.StoreName,
                p.Amount,
                p.Status,
                p.BankName,
                p.AccountNumber,
                p.ShabaNumber,
                p.RequestedAt,
                p.ProcessedAt,
                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                p.IsDeleted,
                p.DeletedAtUtc,
                Convert.ToBase64String(p.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorPayoutListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("payouts/abandoned")]
    [RequirePermission("vendorFinance.payouts.view")]
    public async Task<ActionResult<PagedResult<AdminVendorPayoutListItemDto>>> AbandonedPayouts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int days = 7,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var cutoff = DateTime.UtcNow.AddDays(-Math.Max(1, days));

        var query = _db.VendorPayouts
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Where(p => !p.IsDeleted)
            .Where(p => p.Status == PayoutStatus.Pending && p.RequestedAt <= cutoff);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p => p.Vendor.StoreName.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminVendorPayoutListItemDto(
                p.Id,
                p.VendorId,
                p.Vendor.StoreName,
                p.Amount,
                p.Status,
                p.BankName,
                p.AccountNumber,
                p.ShabaNumber,
                p.RequestedAt,
                p.ProcessedAt,
                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                p.IsDeleted,
                p.DeletedAtUtc,
                Convert.ToBase64String(p.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorPayoutListItemDto>(items, total, page, pageSize));
    }


    [HttpGet("payouts/{id:guid}")]
    [RequirePermission("vendorFinance.payouts.view")]
    public async Task<ActionResult<AdminVendorPayoutDetailDto>> GetPayout(Guid id)
    {
        var p = await _db.VendorPayouts
            .AsNoTracking()
            .Include(x => x.Vendor)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return NotFound();

        return Ok(new AdminVendorPayoutDetailDto(
            p.Id,
            p.VendorId,
            p.Vendor.StoreName,
            p.Amount,
            p.Status,
            p.BankAccountInfo,
            p.BankName,
            p.AccountNumber,
            p.ShabaNumber,
            p.AdminNotes,
            p.ProcessedBy,
            p.RequestedAt,
            p.ProcessedAt,
            p.CreatedAtUtc,
            p.UpdatedAtUtc,
            p.IsDeleted,
            p.DeletedAtUtc,
            Convert.ToBase64String(p.RowVersion)
        ));
    }


    [HttpDelete("payouts/{id:guid}")]
    [RequirePermission("vendorFinance.payouts.delete")]
    public async Task<IActionResult> SoftDeletePayout(Guid id)
    {
        var p = await _db.VendorPayouts.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        p.IsDeleted = true;
        p.DeletedAtUtc = DateTime.UtcNow;
        p.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("payouts/trash")]
    [RequirePermission("vendorFinance.payouts.trash.view")]
    public async Task<ActionResult<PagedResult<AdminVendorPayoutListItemDto>>> PayoutTrash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0 || pageSize > 100) pageSize = 20;

        var query = _db.VendorPayouts
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Where(p => p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(p => p.Vendor.StoreName.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.DeletedAtUtc ?? p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminVendorPayoutListItemDto(
                p.Id,
                p.VendorId,
                p.Vendor.StoreName,
                p.Amount,
                p.Status,
                p.BankName,
                p.AccountNumber,
                p.ShabaNumber,
                p.RequestedAt,
                p.ProcessedAt,
                p.CreatedAtUtc,
                p.UpdatedAtUtc,
                p.IsDeleted,
                p.DeletedAtUtc,
                Convert.ToBase64String(p.RowVersion)
            ))
            .ToListAsync();

        return Ok(new PagedResult<AdminVendorPayoutListItemDto>(items, total, page, pageSize));
    }


    [HttpPost("payouts/{id:guid}/restore")]
    [RequirePermission("vendorFinance.payouts.restore")]
    public async Task<IActionResult> RestorePayout(Guid id)
    {
        var p = await _db.VendorPayouts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        if (!p.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        p.IsDeleted = false;
        p.DeletedAtUtc = null;
        p.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("payouts/{id:guid}/hard")]
    [RequirePermission("vendorFinance.payouts.hardDelete")]
    public async Task<IActionResult> HardDeletePayout(Guid id)
    {
        var p = await _db.VendorPayouts.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        _db.VendorPayouts.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("payouts/{id:guid}/decision")]
    [RequirePermission("vendorFinance.payouts.decision")]
    public async Task<IActionResult> DecidePayout(Guid id, [FromBody] AdminPayoutDecisionDto dto)
    {
        var p = await _db.VendorPayouts.Include(x => x.Vendor).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (p == null) return NotFound();

        if (p.Status != PayoutStatus.Pending)
            return BadRequest("فقط درخواست‌های Pending قابل بررسی هستند.");

        p.AdminNotes = dto.AdminNotes;
        p.ProcessedAt = DateTime.UtcNow;
        p.Status = dto.Approve ? PayoutStatus.Processing : PayoutStatus.Rejected;
        p.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("payouts/{id:guid}/complete")]
    [RequirePermission("vendorFinance.payouts.complete")]
    public async Task<IActionResult> CompletePayout(Guid id, [FromBody] AdminMarkPayoutCompletedDto dto)
    {
        var p = await _db.VendorPayouts.Include(x => x.Vendor).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (p == null) return NotFound();

        if (p.Status != PayoutStatus.Processing)
            return BadRequest("فقط درخواست‌های Processing قابل تکمیل هستند.");

        var wallet = await _db.VendorWallets.FirstOrDefaultAsync(w => w.VendorId == p.VendorId && !w.IsDeleted);
        if (wallet == null) return BadRequest("Wallet برای این فروشنده یافت نشد.");

        if (wallet.Balance < p.Amount)
            return BadRequest("موجودی قابل برداشت فروشنده برای این تسویه کافی نیست.");

        // کاهش Balance + افزایش TotalWithdrawn
        wallet.Balance -= p.Amount;
        wallet.TotalWithdrawn += p.Amount;
        wallet.UpdatedAtUtc = DateTime.UtcNow;

        // تراکنش برداشت
        var tx = new VendorTransaction
        {
            VendorWalletId = wallet.Id,
            Type = TransactionType.Withdrawal,
            Amount = -p.Amount,
            BalanceAfter = wallet.Balance,
            Description = "Vendor payout completed",
            ReferenceNumber = dto.ReferenceNumber,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.VendorTransactions.Add(tx);

        // وضعیت payout
        p.Status = PayoutStatus.Completed;
        p.AdminNotes = dto.AdminNotes ?? p.AdminNotes;
        p.ProcessedAt = DateTime.UtcNow;
        p.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
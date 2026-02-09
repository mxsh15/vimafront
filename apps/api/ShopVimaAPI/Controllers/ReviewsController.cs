using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Review;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public ReviewsController(ShopDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [RequirePermission("reviews.view")]
    public async Task<ActionResult<PagedResult<ReviewDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] bool? isApproved = null,
        [FromQuery] Guid? productId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Reviews
            .AsNoTracking()
            .Include(r => r.Product)
            .Include(r => r.User)
            .Where(r => !r.IsDeleted);

        if (productId.HasValue)
            query = query.Where(r => r.ProductId == productId.Value);

        if (isApproved.HasValue)
            query = query.Where(r => r.IsApproved == isApproved.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(r => 
                (r.Title != null && r.Title.Contains(s)) ||
                (r.Comment != null && r.Comment.Contains(s)) ||
                r.Product.Title.Contains(s) ||
                r.User.FullName.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.Product.Title,
                r.UserId,
                r.User.FullName,
                r.Rating,
                r.Title,
                r.Comment,
                r.IsApproved,
                r.IsVerifiedPurchase,
                r.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ReviewDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("reviews.view")]
    public async Task<ActionResult<ReviewDto>> Get(Guid id)
    {
        var review = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.Product)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return NotFound();

        return Ok(new ReviewDto(
            review.Id,
            review.ProductId,
            review.Product.Title,
            review.UserId,
            review.User.FullName,
            review.Rating,
            review.Title,
            review.Comment,
            review.IsApproved,
            review.IsVerifiedPurchase,
            review.CreatedAtUtc
        ));
    }

    [HttpGet("products/{productId:guid}")]
    public async Task<ActionResult<List<ReviewDto>>> GetByProduct(Guid productId)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.Product)
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.Product.Title,
                r.UserId,
                r.User.FullName,
                r.Rating,
                r.Title,
                r.Comment,
                r.IsApproved,
                r.IsVerifiedPurchase,
                r.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    [RequirePermission("reviews.create")]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] ReviewCreateDto dto)
    {
        var userId = GetUserId();

        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound("Product not found");

        // Check if user already reviewed this product
        var existingReview = await _db.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == dto.ProductId && 
                r.UserId == userId && !r.IsDeleted);

        if (existingReview != null)
            return Conflict("You have already reviewed this product.");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            OrderItemId = dto.OrderItemId,
            IsVerifiedPurchase = dto.OrderItemId.HasValue,
            IsApproved = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        // Reload with includes
        await _db.Entry(review).Reference(r => r.Product).LoadAsync();
        await _db.Entry(review).Reference(r => r.User).LoadAsync();

        return CreatedAtAction(nameof(Get), new { id = review.Id }, new ReviewDto(
            review.Id,
            review.ProductId,
            review.Product.Title,
            review.UserId,
            review.User.FullName,
            review.Rating,
            review.Title,
            review.Comment,
            review.IsApproved,
            review.IsVerifiedPurchase,
            review.CreatedAtUtc
        ));
    }

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("reviews.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound();

        review.IsApproved = true;
        review.ApprovedAt = DateTime.UtcNow;
        review.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/reject")]
    [RequirePermission("reviews.reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound();

        review.IsApproved = false;
        review.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("reviews.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound();

        review.IsDeleted = true;
        review.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}


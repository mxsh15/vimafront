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

    public record ReviewVoteDto(int Value); // 1=like, -1=dislike, 0=remove

    private async Task RecalcProductReviewAggregates(Guid productId)
    {
        var agg = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.ProductId == productId && r.IsApproved && !r.IsDeleted)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                RatingCount = g.Count(),
                RatingAverage = g.Average(x => (double)x.Rating),
                ReviewCount = g.Count(),
            })
            .FirstOrDefaultAsync();

        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == productId);
        if (p == null) return;

        p.RatingCount = agg?.RatingCount ?? 0;
        p.ReviewCount = agg?.ReviewCount ?? 0;
        p.RatingAverage = agg == null ? 0 : Math.Round(agg.RatingAverage, 2);
        p.UpdatedAtUtc = DateTime.UtcNow;
    }

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
                r.LikeCount,
                r.DislikeCount,
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
            review.LikeCount,
            review.DislikeCount,
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
                r.LikeCount,
                r.DislikeCount,
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
            review.LikeCount,
            review.DislikeCount,
            review.CreatedAtUtc
        ));
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Submit([FromBody] ReviewCreateDto dto)
    {
        var userId = GetUserId();

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && !p.IsDeleted);
        if (product == null) return NotFound("Product not found");
        if (!product.AllowCustomerReviews) return BadRequest("Reviews are disabled for this product.");

        // هر کاربر فقط یک دیدگاه برای هر محصول (فعلاً)
        var existing = await _db.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == dto.ProductId && r.UserId == userId && !r.IsDeleted);
        if (existing != null) return Conflict("You have already reviewed this product.");

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Title = dto.Title,
            Comment = (dto.Comment ?? string.Empty).Trim(),
            OrderItemId = dto.OrderItemId,
            IsVerifiedPurchase = dto.OrderItemId.HasValue,
            IsApproved = false, // 👈 حتماً Pending
            CreatedAtUtc = DateTime.UtcNow,
        };

        if (string.IsNullOrWhiteSpace(review.Comment))
            return BadRequest("Comment is required.");

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

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
            review.LikeCount,
            review.DislikeCount,
            review.CreatedAtUtc
        ));
    }

    [HttpPut("{id:guid}/approve")]
    [RequirePermission("reviews.approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var adminId = GetUserId();
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound();

        review.IsApproved = true;
        review.ApprovedAt = DateTime.UtcNow;
        review.ApprovedBy = adminId;
        review.UpdatedAtUtc = DateTime.UtcNow;

        await RecalcProductReviewAggregates(review.ProductId);
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

        await RecalcProductReviewAggregates(review.ProductId);
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

        await RecalcProductReviewAggregates(review.ProductId);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpPost("{id:guid}/vote")]
    [Authorize]
    public async Task<ActionResult<object>> Vote(Guid id, [FromBody] ReviewVoteDto dto)
    {
        var userId = GetUserId();

        var value = dto.Value;
        if (value != 1 && value != -1 && value != 0)
            return BadRequest("Value must be 1, -1 or 0.");

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        if (review == null) return NotFound();

        if (!review.IsApproved) return BadRequest("Cannot vote on unapproved reviews.");

        var reaction = await _db.ReviewReactions
            .FirstOrDefaultAsync(x => x.ReviewId == id && x.UserId == userId && !x.IsDeleted);

        int userVote = 0;

        if (reaction == null)
        {
            if (value == 0)
            {
                userVote = 0;
            }
            else
            {
                reaction = new ReviewReaction
                {
                    ReviewId = id,
                    UserId = userId,
                    Value = value,
                    CreatedAtUtc = DateTime.UtcNow
                };
                _db.ReviewReactions.Add(reaction);

                if (value == 1) review.LikeCount += 1;
                if (value == -1) review.DislikeCount += 1;

                userVote = value;
            }
        }
        else
        {
            // حذف رأی (یا تکرار رأی قبلی)
            if (value == 0 || reaction.Value == value)
            {
                if (reaction.Value == 1) review.LikeCount = Math.Max(0, review.LikeCount - 1);
                if (reaction.Value == -1) review.DislikeCount = Math.Max(0, review.DislikeCount - 1);

                reaction.IsDeleted = true;
                reaction.DeletedAtUtc = DateTime.UtcNow;

                userVote = 0;
            }
            else
            {
                // تغییر رأی
                if (reaction.Value == 1) review.LikeCount = Math.Max(0, review.LikeCount - 1);
                if (reaction.Value == -1) review.DislikeCount = Math.Max(0, review.DislikeCount - 1);

                reaction.Value = value;
                reaction.UpdatedAtUtc = DateTime.UtcNow;

                if (value == 1) review.LikeCount += 1;
                if (value == -1) review.DislikeCount += 1;

                userVote = value;
            }
        }

        review.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            likeCount = review.LikeCount,
            dislikeCount = review.DislikeCount,
            userVote
        });
    }


}

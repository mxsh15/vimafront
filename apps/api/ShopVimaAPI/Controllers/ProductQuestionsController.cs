using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ProductQuestion;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/product-questions")]
public class ProductQuestionsController : ControllerBase
{
    private readonly ShopDbContext _db;

    public ProductQuestionsController(ShopDbContext db) => _db = db;

    private Guid GetUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(val))
            throw new InvalidOperationException("User id claim is missing.");
        return Guid.Parse(val);
    }
    public record AnswerVoteDto(int Value); // 1=like, -1=dislike, 0=remove

    private async Task RecalcProductQuestionAggregates(Guid productId)
    {
        var count = await _db.ProductQuestions
            .AsNoTracking()
            .Where(q => q.ProductId == productId && q.IsApproved && !q.IsDeleted)
            .CountAsync();

        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == productId);
        if (p == null) return;

        p.QuestionCount = count;
        p.UpdatedAtUtc = DateTime.UtcNow;
    }

    private async Task RecalcQuestionAnsweredFlag(Guid questionId)
    {
        var q = await _db.ProductQuestions
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(x => x.Id == questionId && !x.IsDeleted);

        if (q == null) return;

        q.IsAnswered = q.Answers.Any(a => !a.IsDeleted);
        q.UpdatedAtUtc = DateTime.UtcNow;
    }

    // ---------------- ADMIN LIST ----------------
    [HttpGet]
    [RequirePermission("product-questions.view")]
    public async Task<ActionResult<PagedResult<ProductQuestionDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] bool? isAnswered = null,
        [FromQuery] bool? isApproved = null,
        [FromQuery] Guid? productId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers)
            .Where(x => !x.IsDeleted);

        if (productId.HasValue)
            query = query.Where(x => x.ProductId == productId.Value);

        if (isAnswered.HasValue)
        {
            if (isAnswered.Value)
                query = query.Where(x => x.Answers.Any(a => !a.IsDeleted));
            else
                query = query.Where(x => !x.Answers.Any(a => !a.IsDeleted));
        }

        if (isApproved.HasValue)
            query = query.Where(x => x.IsApproved == isApproved.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x =>
                x.Question.Contains(s) ||
                x.Product.Title.Contains(s) ||
                x.User.FullName.Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductQuestionDto(
                x.Id,
                x.ProductId,
                x.Product.Title,
                x.UserId,
                x.User.FullName,
                x.Question,
                x.IsApproved,
                x.Answers.Any(a => !a.IsDeleted),
                x.Answers.Count(a => !a.IsDeleted),
                x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductQuestionDto>(items, total, page, pageSize));
    }

    // ---------------- ADMIN GET ----------------
    [HttpGet("{id:guid}")]
    [RequirePermission("product-questions.view")]
    public async Task<ActionResult<ProductQuestionDto>> Get(Guid id)
    {
        var q = await _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (q == null) return NotFound();

        var dto = new ProductQuestionDto(
            q.Id,
            q.ProductId,
            q.Product.Title,
            q.UserId,
            q.User.FullName,
            q.Question,
            q.IsApproved,
            q.IsAnswered,
            q.Answers.Count(a => !a.IsDeleted),
            q.CreatedAtUtc
        );

        return Ok(dto);
    }


    // ---------------- ADMIN DETAIL ----------------
    [HttpGet("{id:guid}/detail")]
    [RequirePermission("product-questions.view")]
    public async Task<ActionResult<ProductQuestionDetailDto>> GetDetail(Guid id)
    {
        var q = await _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers).ThenInclude(a => a.Vendor)
            .Include(x => x.Answers).ThenInclude(a => a.User)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (q == null) return NotFound();

        var answers = q.Answers
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new ProductAnswerAdminDto(
                a.Id,
                a.QuestionId,
                a.Answer,
                a.IsVerified,
                a.VendorId,
                a.Vendor != null ? a.Vendor.StoreName : null,
                a.UserId,
                a.User != null ? a.User.FullName : null,
                a.CreatedAtUtc,
                a.IsDeleted,
                a.DeletedAtUtc,
                Convert.ToBase64String(a.RowVersion)
            ))
            .ToList();

        var dto = new ProductQuestionDetailDto(
            q.Id,
            q.ProductId,
            q.Product.Title,
            q.UserId,
            q.User.FullName,
            q.Question,
            q.IsApproved,
            q.IsAnswered,
            q.CreatedAtUtc,
            q.IsDeleted,
            q.DeletedAtUtc,
            Convert.ToBase64String(q.RowVersion),
            answers
        );

        return Ok(dto);
    }


    // ---------------- PUBLIC LIST BY PRODUCT ----------------
    [HttpGet("by-product/{productId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<object>>> GetByProduct(
        Guid productId,
        [FromQuery] bool includeAnswers = false,
        [FromQuery] int answersTake = 2)
    {
        if (answersTake <= 0) answersTake = 2;
        if (answersTake > 10) answersTake = 10;

        var list = await _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers)
                .ThenInclude(a => a.Vendor)
            .Include(x => x.Answers)
                .ThenInclude(a => a.User)
            .Where(x => x.ProductId == productId && x.IsApproved && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        var result = list.Select(x =>
        {
            var verifiedAnswers = x.Answers
                .Where(a => !a.IsDeleted && a.IsVerified)
                .OrderByDescending(a => a.CreatedAtUtc)
                .Take(includeAnswers ? answersTake : 0)
                .Select(a => new
                {
                    id = a.Id,
                    questionId = a.QuestionId,
                    answer = a.Answer,
                    isVerified = a.IsVerified,
                    vendorId = a.VendorId,
                    vendorStoreName = a.Vendor != null ? a.Vendor.StoreName : null,
                    userId = a.UserId,
                    userFullName = a.User != null ? a.User.FullName : null,
                    createdAtUtc = a.CreatedAtUtc,
                    likeCount = a.LikeCount,
                    dislikeCount = a.DislikeCount
                })
                .ToList();

            var verifiedCount = x.Answers.Count(a => !a.IsDeleted && a.IsVerified);

            return new
            {
                id = x.Id,
                productId = x.ProductId,
                productTitle = x.Product.Title,
                userId = x.UserId,
                userFullName = x.User.FullName,
                question = x.Question,
                isAnswered = verifiedCount > 0,
                answersCount = verifiedCount,
                createdAtUtc = x.CreatedAtUtc,
                answers = includeAnswers ? verifiedAnswers : null
            };
        });

        return Ok(result);
    }

    // ---------------- PUBLIC SUBMIT QUESTION ----------------
    [HttpPost("submit")]
    [Authorize]
    public async Task<ActionResult<object>> Submit([FromBody] ProductQuestionCreateDto dto)
    {
        if (dto.ProductId == Guid.Empty) return BadRequest("ProductId is required.");
        if (string.IsNullOrWhiteSpace(dto.Question)) return BadRequest("Question is required.");

        var userId = GetUserId();

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && !p.IsDeleted);
        if (product == null) return NotFound("Product not found");
        if (!product.AllowCustomerQuestions) return BadRequest("Questions are disabled for this product.");

        var question = new ProductQuestion
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Question = dto.Question.Trim(),
            IsAnswered = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.ProductQuestions.Add(question);
        await _db.SaveChangesAsync();

        // pending تایید: هیچ داده‌ای برای نمایش عمومی نمی‌دهیم
        return Accepted(new
        {
            id = question.Id,
            status = "pending",
            message = "پرسش شما ثبت شد و پس از تایید مدیر نمایش داده می‌شود."
        });
    }

    // ---------------- ADMIN CREATE ----------------
    [HttpPost]
    [RequirePermission("product-questions.create")]
    public async Task<ActionResult<ProductQuestionDto>> Create([FromBody] ProductQuestionCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Question))
            return BadRequest("Question is required.");

        var userId = GetUserId();

        var product = await _db.Products.FindAsync(dto.ProductId);
        if (product == null) return NotFound("Product not found");

        var question = new ProductQuestion
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Question = dto.Question.Trim(),
            IsAnswered = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.ProductQuestions.Add(question);
        await _db.SaveChangesAsync();

        await RecalcProductQuestionAggregates(dto.ProductId);
        await _db.SaveChangesAsync();

        question = await _db.ProductQuestions
            .Include(x => x.Product)
            .Include(x => x.User)
            .FirstAsync(x => x.Id == question.Id);

        var result = new ProductQuestionDto(
            question.Id,
            question.ProductId,
            question.Product.Title,
            question.UserId,
            question.User.FullName,
            question.Question,
            question.IsApproved,
            question.IsAnswered,
            0,
            question.CreatedAtUtc
        );

        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    // ---------------- ANSWER (Vendor/Admin) ----------------
    [HttpPost("{id:guid}/answers")]
    [RequirePermission("product-questions.answer")]
    public async Task<ActionResult<ProductAnswerDto>> Answer(Guid id, [FromBody] ProductAnswerCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Answer))
            return BadRequest("Answer is required.");

        var userId = GetUserId();

        var question = await _db.ProductQuestions
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (!question.IsApproved)
            return BadRequest("Question must be approved before answering.");

        var answer = new ProductAnswer
        {
            QuestionId = question.Id,
            Answer = dto.Answer.Trim(),
            UserId = userId,
            VendorId = null,
            IsVerified = true,
            CreatedAtUtc = DateTime.UtcNow,
            LikeCount = 0,
            DislikeCount = 0
        };

        _db.ProductAnswers.Add(answer);

        question.IsAnswered = true;
        question.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await RecalcQuestionAnsweredFlag(question.Id);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);

        var result = new ProductAnswerDto(
            answer.Id,
            answer.QuestionId,
            answer.Answer,
            answer.IsVerified,
            answer.VendorId,
            null,
            answer.UserId,
            user?.FullName,
            answer.CreatedAtUtc
        );

        return Ok(result);
    }

    // ---------------- VERIFY ANSWER ----------------
    [HttpPut("answers/{answerId:guid}/verify")]
    [RequirePermission("product-questions.verify-answer")]
    public async Task<IActionResult> VerifyAnswer(Guid answerId, [FromQuery] bool isVerified = true)
    {
        var answer = await _db.ProductAnswers
            .FirstOrDefaultAsync(a => a.Id == answerId && !a.IsDeleted);

        if (answer == null) return NotFound();

        answer.IsVerified = isVerified;
        answer.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await RecalcQuestionAnsweredFlag(answer.QuestionId);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ---------------- VOTE ON ANSWER (مثل reviews/{id}/vote) ----------------
    [HttpPost("answers/{answerId:guid}/vote")]
    [Authorize]
    public async Task<ActionResult<object>> VoteAnswer(Guid answerId, [FromBody] AnswerVoteDto dto)
    {
        var userId = GetUserId();

        var value = dto.Value;
        if (value != 1 && value != -1 && value != 0)
            return BadRequest("Value must be 1, -1 or 0.");

        var answer = await _db.ProductAnswers
            .FirstOrDefaultAsync(a => a.Id == answerId && !a.IsDeleted);

        if (answer == null) return NotFound();

        if (!answer.IsVerified) return BadRequest("Cannot vote on unverified answers.");

        var reaction = await _db.ProductAnswerReactions
            .FirstOrDefaultAsync(x => x.ProductAnswerId == answerId && x.UserId == userId && !x.IsDeleted);

        int userVote = 0;

        if (reaction == null)
        {
            if (value == 0)
            {
                userVote = 0;
            }
            else
            {
                reaction = new ProductAnswerReaction
                {
                    ProductAnswerId = answerId,
                    UserId = userId,
                    Value = value,
                    CreatedAtUtc = DateTime.UtcNow
                };
                _db.ProductAnswerReactions.Add(reaction);

                if (value == 1) answer.LikeCount += 1;
                if (value == -1) answer.DislikeCount += 1;

                userVote = value;
            }
        }
        else
        {
            // حذف رأی (یا تکرار رأی قبلی)
            if (value == 0 || reaction.Value == value)
            {
                if (reaction.Value == 1) answer.LikeCount = Math.Max(0, answer.LikeCount - 1);
                if (reaction.Value == -1) answer.DislikeCount = Math.Max(0, answer.DislikeCount - 1);

                reaction.IsDeleted = true;
                reaction.DeletedAtUtc = DateTime.UtcNow;

                userVote = 0;
            }
            else
            {
                // تغییر رأی
                if (reaction.Value == 1) answer.LikeCount = Math.Max(0, answer.LikeCount - 1);
                if (reaction.Value == -1) answer.DislikeCount = Math.Max(0, answer.DislikeCount - 1);

                reaction.Value = value;
                reaction.UpdatedAtUtc = DateTime.UtcNow;

                if (value == 1) answer.LikeCount += 1;
                if (value == -1) answer.DislikeCount += 1;

                userVote = value;
            }
        }

        answer.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            likeCount = answer.LikeCount,
            dislikeCount = answer.DislikeCount,
            userVote
        });
    }

    // ---------------- DELETE QUESTION ----------------
    [HttpDelete("{id:guid}")]
    [RequirePermission("product-questions.delete")]
    public async Task<IActionResult> DeleteQuestion(Guid id)
    {
        var q = await _db.ProductQuestions.FirstOrDefaultAsync(x => x.Id == id);
        if (q == null) return NotFound();

        q.IsDeleted = true;
        q.DeletedAtUtc = DateTime.UtcNow;

        var answers = await _db.ProductAnswers
                                .Where(a => a.QuestionId == id && !a.IsDeleted)
                                .ToListAsync();

        foreach (var a in answers)
        {
            a.IsDeleted = true;
            a.DeletedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        await RecalcProductQuestionAggregates(q.ProductId);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // ---------------- DELETE ANSWER ----------------
    [HttpDelete("answers/{answerId:guid}")]
    [RequirePermission("product-questions.delete-answer")]
    public async Task<IActionResult> DeleteAnswer(Guid answerId)
    {
        var a = await _db.ProductAnswers.FirstOrDefaultAsync(x => x.Id == answerId);
        if (a == null) return NotFound();

        a.IsDeleted = true;
        a.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await RecalcQuestionAnsweredFlag(a.QuestionId);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    // ---------------- APPROVE / UNAPPROVE QUESTION ----------------
    [HttpPut("{id:guid}/approve")]
    [RequirePermission("product-questions.approve")]
    public async Task<IActionResult> Approve(Guid id, [FromQuery] bool isApproved = true)
    {
        var adminUserId = GetUserId();

        var q = await _db.ProductQuestions
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (q == null) return NotFound();

        var now = DateTime.UtcNow;
        if (isApproved)
            q.Approve(adminUserId, now);
        else
            q.Unapprove(adminUserId, now);

        await _db.SaveChangesAsync();

        await RecalcProductQuestionAggregates(q.ProductId);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    // ---------------- PUBLIC ANSWERS BY QUESTION ----------------
    [HttpGet("{id:guid}/public-answers")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<object>>> GetPublicAnswersByQuestion(Guid id)
    {
        var q = await _db.ProductQuestions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.IsApproved && !x.IsDeleted);

        if (q == null) return NotFound();

        var answers = await _db.ProductAnswers
            .AsNoTracking()
            .Include(a => a.Vendor)
            .Include(a => a.User)
            .Where(a => a.QuestionId == id && !a.IsDeleted && a.IsVerified)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new
            {
                id = a.Id,
                questionId = a.QuestionId,
                answer = a.Answer,
                isVerified = a.IsVerified,
                vendorId = a.VendorId,
                vendorStoreName = a.Vendor != null ? a.Vendor.StoreName : null,
                userId = a.UserId,
                userFullName = a.User != null ? a.User.FullName : null,
                createdAtUtc = a.CreatedAtUtc,
                likeCount = a.LikeCount,
                dislikeCount = a.DislikeCount
            })
            .ToListAsync();

        return Ok(answers);
    }

}

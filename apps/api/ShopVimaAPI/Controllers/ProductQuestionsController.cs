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

    // لیست برای ادمین
    [HttpGet]
    [RequirePermission("product-questions.view")]
    public async Task<ActionResult<PagedResult<ProductQuestionDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] bool? isAnswered = null,
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
            query = query.Where(x => x.IsAnswered == isAnswered.Value);

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
                x.IsAnswered,
                x.Answers.Count(a => !a.IsDeleted),
                x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductQuestionDto>(items, total, page, pageSize));
    }

    // گرفتن یک سؤال + جواب‌ها (برای صفحه جزئیات یا فرانت)
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
            q.IsAnswered,
            q.Answers.Count(a => !a.IsDeleted),
            q.CreatedAtUtc
        );

        return Ok(dto);
    }

    // لیست سوال‌های یک محصول برای فرانت
    [HttpGet("by-product/{productId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductQuestionDto>>> GetByProduct(Guid productId)
    {
        var list = await _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers)
            .Where(x => x.ProductId == productId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        var result = list.Select(x => new ProductQuestionDto(
            x.Id,
            x.ProductId,
            x.Product.Title,
            x.UserId,
            x.User.FullName,
            x.Question,
            x.IsAnswered,
            x.Answers.Count(a => !a.IsDeleted),
            x.CreatedAtUtc
        ));

        return Ok(result);
    }

    // ثبت سؤال توسط کاربر لاگین‌شده
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
            Question = dto.Question.Trim()
        };

        _db.ProductQuestions.Add(question);
        await _db.SaveChangesAsync();

        // دوباره لود برای پر کردن navigationها
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
            question.IsAnswered,
            0,
            question.CreatedAtUtc
        );

        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    // ثبت پاسخ برای یک سؤال
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

        if (question == null) return NotFound("Question not found");

        var answer = new ProductAnswer
        {
            QuestionId = question.Id,
            Answer = dto.Answer.Trim(),
            UserId = userId,     // فعلاً همه پاسخ‌ها را به‌عنوان کاربر ثبت می‌کنیم
            VendorId = null
        };

        _db.ProductAnswers.Add(answer);
        question.IsAnswered = true;
        question.UpdatedAtUtc = DateTime.UtcNow;

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

    // تأیید / لغو تأیید پاسخ توسط ادمین
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
        return NoContent();
    }

    // حذف نرم سؤال
    [HttpDelete("{id:guid}")]
    [RequirePermission("product-questions.delete")]
    public async Task<IActionResult> DeleteQuestion(Guid id)
    {
        var q = await _db.ProductQuestions.FirstOrDefaultAsync(x => x.Id == id);
        if (q == null) return NotFound();

        q.IsDeleted = true;
        q.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // حذف نرم پاسخ
    [HttpDelete("answers/{answerId:guid}")]
    [RequirePermission("product-questions.delete-answer")]
    public async Task<IActionResult> DeleteAnswer(Guid answerId)
    {
        var a = await _db.ProductAnswers.FirstOrDefaultAsync(x => x.Id == answerId);
        if (a == null) return NotFound();

        a.IsDeleted = true;
        a.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET: /api/product-questions/{id}/detail
    [HttpGet("{id:guid}/detail")]
    [RequirePermission("product-questions.view")]
    public async Task<ActionResult<ProductQuestionDetailDto>> GetDetail(Guid id)
    {
        var q = await _db.ProductQuestions
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers).ThenInclude(a => a.User)
            .Include(x => x.Answers).ThenInclude(a => a.Vendor)
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

        return Ok(new ProductQuestionDetailDto(
            q.Id,
            q.ProductId,
            q.Product.Title,
            q.UserId,
            q.User.FullName,
            q.Question,
            q.IsAnswered,
            q.CreatedAtUtc,
            q.IsDeleted,
            q.DeletedAtUtc,
            Convert.ToBase64String(q.RowVersion),
            answers
        ));
    }

    // GET: /api/product-questions/trash
    [HttpGet("trash")]
    [RequirePermission("product-questions.trash.view")]
    public async Task<ActionResult<PagedResult<ProductQuestionDto>>> Trash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ProductQuestions
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.User)
            .Include(x => x.Answers)
            .Where(x => x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(x => x.Question.Contains(s) || x.Product.Title.Contains(s) || x.User.FullName.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.DeletedAtUtc ?? x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductQuestionDto(
                x.Id, x.ProductId, x.Product.Title, x.UserId, x.User.FullName, x.Question,
                x.IsAnswered, x.Answers.Count(a => !a.IsDeleted), x.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductQuestionDto>(items, total, page, pageSize));
    }

    // POST: /api/product-questions/{id}/restore
    [HttpPost("{id:guid}/restore")]
    [RequirePermission("product-questions.restore")]
    public async Task<IActionResult> RestoreQuestion(Guid id)
    {
        var q = await _db.ProductQuestions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (q == null) return NotFound();
        if (!q.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        q.IsDeleted = false;
        q.DeletedAtUtc = null;
        q.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/product-questions/{id}/hard
    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("product-questions.hardDelete")]
    public async Task<IActionResult> HardDeleteQuestion(Guid id)
    {
        var q = await _db.ProductQuestions
            .IgnoreQueryFilters()
            .Include(x => x.Answers)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (q == null) return NotFound();

        _db.ProductAnswers.RemoveRange(q.Answers);
        _db.ProductQuestions.Remove(q);

        await _db.SaveChangesAsync();
        return NoContent();
    }


    // PUT: /api/product-questions/answers/{answerId}
    [HttpPut("answers/{answerId:guid}")]
    [RequirePermission("product-questions.edit-answer")]
    public async Task<IActionResult> UpdateAnswer(Guid answerId, [FromBody] ProductAnswerCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Answer))
            return BadRequest("Answer is required.");

        var a = await _db.ProductAnswers.FirstOrDefaultAsync(x => x.Id == answerId);
        if (a == null) return NotFound();

        a.Answer = dto.Answer.Trim();
        a.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET: /api/product-questions/answers/trash
    [HttpGet("answers/trash")]
    [RequirePermission("product-questions.trash.view")]
    public async Task<ActionResult<PagedResult<ProductAnswerDto>>> AnswersTrash(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null
    )
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.ProductAnswers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(a => a.Question).ThenInclude(qn => qn.Product)
            .Include(a => a.User)
            .Include(a => a.Vendor)
            .Where(a => a.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(a =>
                a.Answer.Contains(s) ||
                a.Question.Question.Contains(s) ||
                a.Question.Product.Title.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.DeletedAtUtc ?? a.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ProductAnswerDto(
                a.Id,
                a.QuestionId,
                a.Answer,
                a.IsVerified,
                a.VendorId,
                a.Vendor != null ? a.Vendor.StoreName : null,
                a.UserId,
                a.User != null ? a.User.FullName : null,
                a.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<ProductAnswerDto>(items, total, page, pageSize));
    }

    // POST: /api/product-questions/answers/{answerId}/restore
    [HttpPost("answers/{answerId:guid}/restore")]
    [RequirePermission("product-questions.restore")]
    public async Task<IActionResult> RestoreAnswer(Guid answerId)
    {
        var a = await _db.ProductAnswers.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == answerId);
        if (a == null) return NotFound();
        if (!a.IsDeleted) return BadRequest("این مورد حذف نشده است.");

        a.IsDeleted = false;
        a.DeletedAtUtc = null;
        a.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: /api/product-questions/answers/{answerId}/hard
    [HttpDelete("answers/{answerId:guid}/hard")]
    [RequirePermission("product-questions.hardDelete")]
    public async Task<IActionResult> HardDeleteAnswer(Guid answerId)
    {
        var a = await _db.ProductAnswers.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == answerId);
        if (a == null) return NotFound();

        _db.ProductAnswers.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }


}
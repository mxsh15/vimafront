using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Blog;
using ShopVima.Application.Utils;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using ShopVimaAPI.Attributes;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/blog-posts")]
[Authorize]
public class BlogPostsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public BlogPostsController(ShopDbContext db) => _db = db;


    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var userId))
            throw new InvalidOperationException("Current user id claim is missing or invalid.");

        return userId;
    }
    private bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }



    [HttpGet]
    [RequirePermission("blog-posts.view")]
    public async Task<ActionResult<PagedResult<BlogPostListDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? tagId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.BlogPosts
            .AsNoTracking()
            .Include(p => p.PostCategories).ThenInclude(pc => pc.Category)
            .Include(p => p.Author)
            .Where(p => !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(p => p.Title.Contains(term));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p =>
                p.PostCategories.Any(pc => pc.CategoryId == categoryId.Value));
        }

        if (tagId.HasValue)
        {
            query = query.Where(p =>
                p.PostTags.Any(pt => pt.TagId == tagId.Value));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostListDto(
                p.Id,
                p.ThumbnailMediaId,
                p.ThumbnailImageUrl,
                p.Title,
                p.Slug,
                p.AuthorId,
                p.Author != null ? p.Author.FullName : null,
                p.PostCategories.Select(pc => pc.Category.Name).ToList(),
                (int)p.Status,
                (p.Status == ProductStatus.Published) ? p.CreatedAtUtc : null,
                p.UpdatedAtUtc,
                p.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogPostListDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    [RequirePermission("blog-posts.view")]
    public async Task<ActionResult<BlogPostDetailDto>> Get(Guid id)
    {
        var p = await _db.BlogPosts
            .Include(x => x.Author)
            .Include(x => x.PostCategories).ThenInclude(pc => pc.Category)
            .Include(x => x.PostTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (p == null) return NotFound();

        var dto = new BlogPostDetailDto(
            p.Id,
            p.Title,
            p.Slug,
            p.ContentHtml,
            p.ThumbnailImageUrl,
            p.ThumbnailMediaId,
            p.CreatedAtUtc,
            p.UpdatedAtUtc,
            p.Author?.FullName,
            p.PostCategories
                .Select(pc => new BlogCategoryDto(
                    pc.CategoryId,
                    pc.Category.Name,
                    pc.Category.Slug,
                    pc.Category.Description,
                    pc.Category.ParentId,
                    pc.Category.Parent != null ? pc.Category.Parent.Name : null
                )).ToList(),
            p.PostTags
                .Select(pt => new BlogTagDto(
                    pt.TagId,
                    pt.Tag.Name,
                    pt.Tag.Slug
                )).ToList(),
            p.Seo.MetaTitle,
            p.Seo.MetaDescription,
            p.Seo.Keywords,
            p.Seo.CanonicalUrl,
            p.Seo.SeoMetaRobots,
            p.Seo.SeoSchemaJson,
            p.Seo.AutoGenerateSnippet,
            p.Seo.AutoGenerateHeadTags,
            p.Seo.IncludeInSitemap,
            (int)p.Status,
            (int)p.Visibility
        );

        return Ok(dto);
    }

    [HttpPost]
    [RequirePermission("blog-posts.create")]
    public async Task<ActionResult<BlogPostDetailDto>> Create([FromBody] BlogPostUpsertDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");


        var post = new BlogPost
        {
            Title = dto.Title.Trim(),
            ShortTitle = dto.ShortTitle,
            Slug = dto.Slug.Trim(),
            ContentHtml = dto.ContentHtml,
            Status = dto.Status,
            Visibility = dto.Visibility
        };

        post.Seo.MetaTitle = dto.MetaTitle;
        post.Seo.MetaDescription = dto.MetaDescription;
        post.Seo.Keywords = dto.Keywords;
        post.Seo.CanonicalUrl = dto.CanonicalUrl;
        post.Seo.SeoMetaRobots = dto.SeoMetaRobots;
        post.Seo.SeoSchemaJson = dto.SeoSchemaJson;
        post.Seo.AutoGenerateSnippet = dto.AutoGenerateSnippet;
        post.Seo.AutoGenerateHeadTags = dto.AutoGenerateHeadTags;
        post.Seo.IncludeInSitemap = dto.IncludeInSitemap;

        if (isAdmin && dto.AuthorId.HasValue)
        {
            post.AuthorId = dto.AuthorId.Value;
        }
        else
        {
            post.AuthorId = currentUserId;
        }

        // دسته‌ها
        if (dto.CategoryIds?.Any() == true)
        {
            post.PostCategories = dto.CategoryIds
                .Distinct()
                .Select(id => new BlogPostCategory { CategoryId = id, Post = post })
                .ToList();
        }

        // برچسب‌ها
        if (dto.TagIds?.Any() == true)
        {
            post.PostTags = dto.TagIds
                .Distinct()
                .Select(id => new BlogPostTag { TagId = id, Post = post })
                .ToList();
        }

        if (dto.ThumbnailMediaId.HasValue)
        {
            var asset = await _db.MediaAssets
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == dto.ThumbnailMediaId.Value);

            if (asset == null)
                return BadRequest("Thumbnail media asset not found.");

            if (asset.Kind != MediaKind.Image)
                return BadRequest("Thumbnail must be an image.");

            post.ThumbnailMediaId = asset.Id;
            post.ThumbnailImageUrl = asset.ThumbnailUrl ?? asset.Url;
        }
        else if (!string.IsNullOrWhiteSpace(dto.ThumbnailImageUrl))
        {
            post.ThumbnailMediaId = null;
            post.ThumbnailImageUrl = dto.ThumbnailImageUrl.Trim();
        }
        else
        {
            post.ThumbnailMediaId = null;
            post.ThumbnailImageUrl = null;
        }

        _db.BlogPosts.Add(post);
        await _db.SaveChangesAsync();

        return await Get(post.Id);
    }

    [HttpPut("{id:guid}")]
    [RequirePermission("blog-posts.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BlogPostUpsertDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");

        var post = await _db.BlogPosts
            .Include(p => p.PostCategories)
            .Include(p => p.PostTags)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        post.Title = dto.Title.Trim();
        post.ShortTitle = dto.ShortTitle;
        post.Slug = dto.Slug.Trim();
        post.ContentHtml = dto.ContentHtml;
        post.Status = dto.Status;
        post.Visibility = dto.Visibility;

        post.Seo.MetaTitle = dto.MetaTitle;
        post.Seo.MetaDescription = dto.MetaDescription;
        post.Seo.Keywords = dto.Keywords;
        post.Seo.CanonicalUrl = dto.CanonicalUrl;
        post.Seo.SeoMetaRobots = dto.SeoMetaRobots;
        post.Seo.SeoSchemaJson = dto.SeoSchemaJson;
        post.Seo.AutoGenerateSnippet = dto.AutoGenerateSnippet;
        post.Seo.AutoGenerateHeadTags = dto.AutoGenerateHeadTags;
        post.Seo.IncludeInSitemap = dto.IncludeInSitemap;

        post.UpdatedAtUtc = DateTime.UtcNow;

        if (isAdmin && dto.AuthorId.HasValue)
        {
            post.AuthorId = dto.AuthorId.Value;
        }
        else
        {
            post.AuthorId = currentUserId;
        }

        // آپدیت دسته‌ها
        post.PostCategories.Clear();
        if (dto.CategoryIds?.Any() == true)
        {
            foreach (var catId in dto.CategoryIds.Distinct())
            {
                post.PostCategories.Add(new BlogPostCategory
                {
                    PostId = post.Id,
                    CategoryId = catId
                });
            }
        }

        // آپدیت تگ‌ها
        post.PostTags.Clear();
        if (dto.TagIds?.Any() == true)
        {
            foreach (var tagId in dto.TagIds.Distinct())
            {
                post.PostTags.Add(new BlogPostTag
                {
                    PostId = post.Id,
                    TagId = tagId
                });
            }
        }


        // تصویر شاخص
        if (dto.ThumbnailMediaId.HasValue)
        {
            var asset = await _db.MediaAssets
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == dto.ThumbnailMediaId.Value);

            if (asset == null)
                return BadRequest("Thumbnail media asset not found.");

            if (asset.Kind != MediaKind.Image)
                return BadRequest("Thumbnail must be an image.");

            post.ThumbnailMediaId = asset.Id;
            post.ThumbnailImageUrl = asset.ThumbnailUrl ?? asset.Url;
        }
        else if (!string.IsNullOrWhiteSpace(dto.ThumbnailImageUrl))
        {
            post.ThumbnailMediaId = null;
            post.ThumbnailImageUrl = dto.ThumbnailImageUrl.Trim();
        }
        else
        {
            post.ThumbnailMediaId = null;
            post.ThumbnailImageUrl = null;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequirePermission("blog-posts.delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var post = await _db.BlogPosts.FirstOrDefaultAsync(p => p.Id == id);
        if (post == null) return NotFound();

        post.IsDeleted = true;
        post.DeletedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpPost("{id:guid}/restore")]
    [RequirePermission("blog-posts.restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var post = await _db.BlogPosts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();
        if (!post.IsDeleted) return BadRequest("این نوشته وبلاگ حذف نشده است");

        post.IsDeleted = false;
        post.DeletedAtUtc = null;
        post.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }


    [HttpDelete("{id:guid}/hard")]
    [RequirePermission("blog-posts.hardDelete")]
    public async Task<IActionResult> HardDelete(Guid id)
    {
        var post = await _db.BlogPosts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        _db.BlogPosts.Remove(post);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpGet("trash")]
    [RequirePermission("blog-posts.trash")]
    public async Task<ActionResult<PagedResult<BlogPostListDto>>> Trash(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? q = null,
    [FromQuery] Guid? categoryId = null,
    [FromQuery] Guid? tagId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.BlogPosts
            .AsNoTracking()
            .IgnoreQueryFilters()                 
            .Include(p => p.PostCategories).ThenInclude(pc => pc.Category)
            .Include(p => p.Author)
            .Where(p => p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(p => p.Title.Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.PostCategories.Any(pc => pc.CategoryId == categoryId.Value));

        if (tagId.HasValue)
            query = query.Where(p => p.PostTags.Any(pt => pt.TagId == tagId.Value));

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.DeletedAtUtc ?? p.UpdatedAtUtc ?? p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new BlogPostListDto(
                p.Id,
                p.ThumbnailMediaId,
                p.ThumbnailImageUrl,
                p.Title,
                p.Slug,
                p.AuthorId,
                p.Author != null ? p.Author.FullName : null,
                p.PostCategories.Select(pc => pc.Category.Name).ToList(),
                (int)p.Status,                                   // وضعیت قبل از حذف
                (p.Status == ProductStatus.Published) ? p.CreatedAtUtc : null,
                p.UpdatedAtUtc,
                p.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(new PagedResult<BlogPostListDto>(items, total, page, pageSize));
    }

}
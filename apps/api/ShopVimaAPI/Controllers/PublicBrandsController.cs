using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Brand;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/public/brands")]
public sealed class PublicBrandsController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicBrandsController(ShopDbContext db) => _db = db;

    // GET /api/public/brands/options
    [HttpGet("options")]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicBrandOptionDto>>> Options()
    {
        var items = await _db.Brands.AsNoTracking()
            .Where(b => !b.IsDeleted /* && b.IsActive */)
            .OrderBy(b => b.Title)
            .Select(b => new PublicBrandOptionDto
            {
                Id = b.Id,
                Title = b.Title,
                Slug = b.Slug,
                LogoUrl = b.LogoUrl
            })
            .ToListAsync();

        return items;
    }
}

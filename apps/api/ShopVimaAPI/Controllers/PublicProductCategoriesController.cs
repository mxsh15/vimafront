using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Category;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.API.Controllers.Public;

[ApiController]
[Route("api/public/productCategories")]
public class PublicProductCategoriesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public PublicProductCategoriesController(ShopDbContext db) => _db = db;

    [HttpGet("options")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CategoryOptionDto>>> Options([FromQuery] bool onlyActive = true)
    {
        var q = _db.CatalogCategories
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (onlyActive)
            q = q.Where(x => x.IsActive);

        var list = await q
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Select(x => new CategoryOptionDto(
                x.Id,
                x.Title,
                x.ParentId,
                x.SortOrder,
                x.IconUrl
            ))
            .ToListAsync();

        return Ok(list);
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Common;
using ShopVima.Application.Utils;
using ShopVima.Domain.Common;
using ShopVima.Infrastructure.Persistence;

namespace ShopVimaAPI.Controllers;

[ApiController]
public abstract class BaseCrudController<TEntity, TListDto, TDto, TCreateUpdateDto> : ControllerBase
    where TEntity : BaseEntity, new()
{
    protected readonly ShopDbContext _db;
    protected readonly DbSet<TEntity> _set;

    protected BaseCrudController(ShopDbContext db)
    {
        _db = db;
        _set = _db.Set<TEntity>();
    }

    protected abstract IQueryable<TEntity> Queryable();
    protected abstract TListDto ToListDto(TEntity e);
    protected abstract TDto ToDto(TEntity e);
    protected abstract void UpdateEntity(TEntity e, TCreateUpdateDto dto, bool isCreate);

    [HttpGet]
    public async Task<ActionResult<PagedResult<TListDto>>> List([FromQuery] PagedRequest req)
    {
        var q = Queryable();
        if (!string.IsNullOrWhiteSpace(req.Q))
            q = q.Where(e => EF.Functions.Like(((object)e)!.ToString()!, $"%{req.Q}%")); 

        var total = await q.LongCountAsync();
        var items = await q
            .OrderByDescending(e => e.CreatedAtUtc)
            .Skip(req.Skip)
            .Take(req.Take)
            .ToListAsync();

        return Ok(new PagedResult<TListDto>((IReadOnlyList<TListDto>)items.Select(ToListDto), req.Page, req.PageSize, (int)total));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TDto>> Get(Guid id)
    {
        var entity = await Queryable().FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();
        return Ok(ToDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<TDto>> Create([FromBody] TCreateUpdateDto dto)
    {
        var entity = new TEntity
        {
            CreatedAtUtc = DateTime.UtcNow
        };
        UpdateEntity(entity, dto, isCreate: true);

        _set.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDto(entity));
    }

    [HttpPut("{id:guid}")]
    public Task<IActionResult> Update(Guid id, [FromBody] TCreateUpdateDto dto)
        => ConcurrencyExtensions.HandleConcurrencyAsync(async () =>
        {
            var entity = await _set.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            var rvProp = dto?.GetType().GetProperty("RowVersion")?.GetValue(dto) as string;
            if (!string.IsNullOrWhiteSpace(rvProp))
                _db.Entry(entity).Property(e => e.RowVersion).OriginalValue = CommonDtos.FromBase64(rvProp);

            UpdateEntity(entity, dto, isCreate: false);
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ToDto(entity));
        });

    [HttpDelete("{id:guid}")]
    public Task<IActionResult> SoftDelete(Guid id)
        => ConcurrencyExtensions.HandleConcurrencyAsync(async () =>
        {
            var entity = await _set.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound();

            entity.IsDeleted = true;
            entity.DeletedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        });

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> Restore(Guid id)
    {
        var entity = await _set.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        entity.IsDeleted = false;
        entity.DeletedAtUtc = null;
        await _db.SaveChangesAsync();
        return Ok(ToDto(entity));
    }

    [HttpDelete("{id:guid}/purge")]
    public async Task<IActionResult> Purge(Guid id)
    {
        var entity = await _set.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return NotFound();

        _set.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;

namespace ShopVima.Importers.WordPress.Core.Services;

public sealed class ExternalMapService
{
    private readonly ShopDbContext _db;

    public ExternalMapService(ShopDbContext db) => _db = db;

    public async Task<Guid> GetOrCreateInternalIdAsync(string provider, string type, string externalId, string? slug, CancellationToken ct = default)
    {
        if (type == "Media" && externalId.Length > 80)
        {
            externalId = HashUtil.Sha256Hex(externalId);
            slug = null;
        }


        var map = await _db.ExternalIdMaps.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Provider == provider && x.EntityType == type && x.ExternalId == externalId, ct);

        if (map == null)
        {
            map = new ExternalIdMap
            {
                Provider = provider,
                EntityType = type,
                ExternalId = externalId,
                InternalId = Guid.NewGuid(),
                ExternalSlug = slug,
                LastSyncedAtUtc = DateTime.UtcNow
            };
            _db.ExternalIdMaps.Add(map);
        }
        else
        {
            map.ExternalSlug = slug;
            map.LastSyncedAtUtc = DateTime.UtcNow;
        }

        //  await _db.SaveChangesAsync(ct);
        return map.InternalId;
    }

    public Task<ExternalIdMap?> FindAsync(string provider, string type, string externalId, CancellationToken ct = default)
        => _db.ExternalIdMaps.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Provider == provider && x.EntityType == type && x.ExternalId == externalId, ct);
}
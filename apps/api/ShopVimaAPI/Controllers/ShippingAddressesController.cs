using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.ShippingAddress;
using ShopVima.Domain.Entities;
using ShopVima.Infrastructure.Persistence;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;

[ApiController]
[Route("api/shipping-addresses")]
[Authorize]
public class ShippingAddressesController : ControllerBase
{
    private readonly ShopDbContext _db;
    public ShippingAddressesController(ShopDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ShippingAddressDto>>> GetMyAddresses()
    {
        var userId = GetUserId();
        var addresses = await _db.ShippingAddresses
            .AsNoTracking()
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAtUtc)
            .Select(a => new ShippingAddressDto(
                a.Id,
                a.UserId,
                a.Title,
                a.Province,
                a.City,
                a.AddressLine,
                a.PostalCode,
                a.IsDefault,
                a.Latitude,
                a.Longitude,
                a.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<ActionResult<ShippingAddressDto>> Create([FromBody] ShippingAddressCreateDto dto)
    {
        var userId = GetUserId();

        if (dto.IsDefault)
        {
            var existingDefault = await _db.ShippingAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();
            foreach (var addr in existingDefault)
            {
                addr.IsDefault = false;
            }
        }

        var address = new ShippingAddress
        {
            UserId = userId,
            Title = dto.Title,
            Province = dto.Province,
            City = dto.City,
            AddressLine = dto.AddressLine,
            PostalCode = string.IsNullOrWhiteSpace(dto.PostalCode) ? null : dto.PostalCode.Trim(),
            IsDefault = dto.IsDefault,
            Longitude = dto.Longitude,
            Latitude = dto.Latitude,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.ShippingAddresses.Add(address);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyAddresses), new ShippingAddressDto(
            address.Id,
            address.UserId,
            address.Title,
            address.Province,
            address.City,
            address.AddressLine,
            address.PostalCode,
            address.IsDefault,
            address.Latitude,
            address.Longitude,
            address.CreatedAtUtc
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var address = await _db.ShippingAddresses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (address == null) return NotFound();

        address.IsDeleted = true;
        address.DeletedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}


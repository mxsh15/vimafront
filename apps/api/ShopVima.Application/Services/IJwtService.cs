using ShopVima.Domain.Entities;

namespace ShopVima.Application.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    string? GetUserIdFromToken(string token);
}


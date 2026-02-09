namespace ShopVima.Application.Dtos.Common;

public static class CommonDtos
{
    public static string ToBase64(byte[] bytes) => Convert.ToBase64String(bytes ?? Array.Empty<byte>());
    public static byte[] FromBase64(string? s) => string.IsNullOrWhiteSpace(s) ? Array.Empty<byte>() : Convert.FromBase64String(s);
}
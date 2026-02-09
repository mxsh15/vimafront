using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ShopVima.Application.Utils;

public static class ConcurrencyExtensions
{
    public static async Task<IActionResult> HandleConcurrencyAsync(Func<Task<IActionResult>> action)
    {
        try
        {
            return await action();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            return new ConflictObjectResult(new
            {
                message = "Concurrency conflict. Entity was modified by another process.",
                details = ex.Message
            });
        }
    }
}
namespace ShopVima.Application.Dtos.VendorFinance;

public record AdminPayoutDecisionDto(
    bool Approve,
    string? AdminNotes
);

namespace ShopVima.Application.Dtos.Returns;

public record AdminCreateRefundDto(
    Guid PaymentId,
    decimal Amount
);

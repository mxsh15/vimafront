namespace ShopVima.Domain.Enums;

public enum PaymentStatus
{
    Pending = 0,           // در انتظار پرداخت
    Processing = 1,        // در حال پردازش
    Completed = 2,         // پرداخت موفق
    Failed = 3,            // پرداخت ناموفق
    Cancelled = 4,         // لغو شده
    Refunded = 5           // بازپرداخت شده
}


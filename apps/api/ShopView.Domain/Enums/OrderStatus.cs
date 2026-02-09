namespace ShopVima.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,           // در انتظار پرداخت
    PaymentPending = 1,    // در انتظار تایید پرداخت
    Processing = 2,        // در حال پردازش
    Shipped = 3,           // ارسال شده
    Delivered = 4,         // تحویل داده شده
    Cancelled = 5,         // لغو شده
    Refunded = 6           // بازپرداخت شده
}


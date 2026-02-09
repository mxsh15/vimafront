namespace ShopVima.Domain.Enums;

public enum ShippingStatus
{
    Pending = 0,           // در انتظار ارسال
    Processing = 1,        // در حال آماده‌سازی
    Shipped = 2,           // ارسال شده
    InTransit = 3,         // در مسیر
    Delivered = 4,         // تحویل داده شده
    Returned = 5           // برگشت خورده
}


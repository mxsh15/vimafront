namespace ShopVima.Domain.Enums;

public enum BackorderPolicy : byte
{
    DoNotAllow = 0,           // اجازه نده
    AllowWithNotice = 1,      // اجازه بده ولی مشتری را مطلع کن
    Allow = 2                 // اجازه بده (بدون هشدار خاص)
}

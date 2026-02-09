namespace ShopVima.Domain.Enums;

public enum AttributeValueType : byte
{
    Unknown = 0, // برای ردیف‌های قدیمی که 0 هستند
    Text = 1,
    Number = 2,
    Boolean = 3,
    DateTime = 4,
    Option = 5, // تک انتخابی
    MultiOption = 6 // چند انتخابی
}
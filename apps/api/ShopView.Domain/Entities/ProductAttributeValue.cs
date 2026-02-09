using ShopVima.Domain.Common;


namespace ShopVima.Domain.Entities;

public class ProductAttributeValue : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid AttributeId { get; set; }
    public ProductAttribute Attribute { get; set; } = default!;


    // اگر این مقدار از طریق یک گروه ویژگی اضافه شده باشد
    public Guid? AttributeGroupId { get; set; }
    public AttributeGroup? AttributeGroup { get; set; }

    // برای attributes از نوع گزینه‌ای (Single Select)
    public Guid? OptionId { get; set; }
    public AttributeOption? Option { get; set; }


    // مقادیر خام بر اساس نوع ValueType در ProductAttribute:
    // Text / String ⇒ RawValue
    // Number ⇒ NumericValue (برای sort/filter) + RawValue برای نمایش
    // Bool ⇒ BoolValue
    // Date/DateTime ⇒ DateTimeValue
    public string? RawValue { get; set; }           // چیزی که ادمین وارد کرده (مثلاً "256 گیگ")
    public decimal? NumericValue { get; set; }      // برای فیلتر و sort عددی (مثلاً 256)
    public bool? BoolValue { get; set; }
    public DateTime? DateTimeValue { get; set; }
    public int DisplayOrder { get; set; } = 0;
}
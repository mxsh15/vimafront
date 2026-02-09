using ShopVima.Domain.Common;
using ShopVima.Domain.Enums;


namespace ShopVima.Domain.Entities;

public class ProductAttribute : BaseEntity
{
    public Guid? AttributeGroupId { get; set; }
    public AttributeGroup AttributeGroup { get; set; } = default!;

    public string Name { get; set; } = default!;   // "حافظه داخلی"
    public string Key { get; set; } = default!;    // "storage"
    public string? Unit { get; set; }              // "گیگابایت"
    public int SortOrder { get; set; } = 0;

    public AttributeValueType ValueType { get; set; } = AttributeValueType.Text;

    // تنظیمات برای فرم ادمین و فیلترها
    public bool IsRequired { get; set; } = false;
    public bool IsVariantLevel { get; set; } = false;         // true = مقدار برای Variant (مثلاً رنگ/حافظه)
    public bool IsFilterable { get; set; } = false;           // نمایش در فیلتر سایدبار
    public bool IsComparable { get; set; } = false;           // استفاده در مقایسه محصولات


    public ICollection<AttributeOption> Options { get; set; } = new List<AttributeOption>();
    public ICollection<ProductAttributeValue> Values { get; set; } = new List<ProductAttributeValue>();
}
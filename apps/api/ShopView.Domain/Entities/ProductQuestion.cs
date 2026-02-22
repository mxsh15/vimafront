using ShopVima.Domain.Common;

namespace ShopVima.Domain.Entities;

public class ProductQuestion : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Question { get; set; } = default!;
    public bool IsAnswered { get; set; } = false;

    public bool IsApproved { get; private set; }
    public DateTime? ApprovedAtUtc { get; private set; }
    public Guid? ApprovedByUserId { get; private set; }

    public ICollection<ProductAnswer> Answers { get; set; } = new List<ProductAnswer>();

    public void Approve(Guid approvedByUserId, DateTime utcNow)
    {
        IsApproved = true;
        ApprovedAtUtc = utcNow;
        ApprovedByUserId = approvedByUserId;
        UpdatedAtUtc = utcNow;
    }

    public void Unapprove(Guid updatedByUserId, DateTime utcNow)
    {
        IsApproved = false;
        ApprovedAtUtc = null;
        ApprovedByUserId = updatedByUserId;
        UpdatedAtUtc = utcNow;
    }
}

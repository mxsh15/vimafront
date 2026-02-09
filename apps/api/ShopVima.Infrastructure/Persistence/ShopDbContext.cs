using Microsoft.EntityFrameworkCore;
using ShopVima.Domain.Constants;
using ShopVima.Domain.Entities;
using System.Reflection.Emit;

namespace ShopVima.Infrastructure.Persistence;

public class ShopDbContext : DbContext
{
    public ShopDbContext(DbContextOptions<ShopDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductMedia> ProductMedia => Set<ProductMedia>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<CatalogCategory> CatalogCategories => Set<CatalogCategory>();
    public DbSet<ProductCategoryAssignment> ProductCategoryAssignments => Set<ProductCategoryAssignment>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<ProductContentTab> ProductContentTabs => Set<ProductContentTab>();
    public DbSet<ProductFeature> ProductFeatures => Set<ProductFeature>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<AttributeSet> AttributeSets => Set<AttributeSet>();
    public DbSet<AttributeGroup> AttributeGroups => Set<AttributeGroup>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<AttributeOption> AttributeOptions => Set<AttributeOption>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<ProductVariantAttributeValue> ProductVariantAttributeValues => Set<ProductVariantAttributeValue>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<VendorOffer> VendorOffers => Set<VendorOffer>();
    public DbSet<VendorOfferVariant> VendorOfferVariants => Set<VendorOfferVariant>();
    public DbSet<VendorOfferModerationLog> VendorOfferModerationLogs => Set<VendorOfferModerationLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shipping> Shippings => Set<Shipping>();
    public DbSet<ShippingAddress> ShippingAddresses => Set<ShippingAddress>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ProductQuestion> ProductQuestions => Set<ProductQuestion>();
    public DbSet<ProductAnswer> ProductAnswers => Set<ProductAnswer>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<VendorWallet> VendorWallets => Set<VendorWallet>();
    public DbSet<VendorTransaction> VendorTransactions => Set<VendorTransaction>();
    public DbSet<VendorPayout> VendorPayouts => Set<VendorPayout>();
    public DbSet<VendorMember> VendorMembers => Set<VendorMember>();
    public DbSet<ReturnRequest> ReturnRequests => Set<ReturnRequest>();
    public DbSet<Refund> Refunds => Set<Refund>();

    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<BlogTag> BlogTags => Set<BlogTag>();
    public DbSet<BlogPostCategory> BlogPostCategories => Set<BlogPostCategory>();
    public DbSet<BlogPostTag> BlogPostTags => Set<BlogPostTag>();


    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();


    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<ShippingZone> ShippingZones => Set<ShippingZone>();
    public DbSet<ShippingZoneRate> ShippingZoneRates => Set<ShippingZoneRate>();


    public DbSet<ExternalIdMap> ExternalIdMaps => Set<ExternalIdMap>();

    public DbSet<HomeBanner> HomeBanner => Set<HomeBanner>();
    public DbSet<QuickService> QuickServices => Set<QuickService>();

    public DbSet<HomeTemplate> HomeTemplates => Set<HomeTemplate>();
    public DbSet<HomeTemplateSection> HomeTemplateSections => Set<HomeTemplateSection>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // فیلتر سافت‌دیلیت روی موجودیت‌های اصلی
        b.Entity<Product>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<Brand>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<CatalogCategory>().HasQueryFilter(x => !x.IsDeleted);

        // RowVersion برای کنترل همزمانی
        b.Entity<Product>().Property(p => p.RowVersion).IsRowVersion();
        b.Entity<Brand>().Property(p => p.RowVersion).IsRowVersion();
        b.Entity<CatalogCategory>().Property(p => p.RowVersion).IsRowVersion();


        // ==== Brand
        b.Entity<Brand>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(256).IsRequired();
            e.Property(x => x.EnglishTitle).HasMaxLength(256);
            e.Property(x => x.Slug).HasMaxLength(256).IsRequired();
            e.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
            });
            e.HasIndex(b => b.Slug)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        });
        

        // ==== Category (self reference)
        b.Entity<CatalogCategory>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(256).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(256).IsRequired();

            e.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            e.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
            });

            e.HasOne(x => x.AttributeSet)
                   .WithMany(s => s.CatalogCategories)
                   .HasForeignKey(x => x.AttributeSetId)
                   .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== Product
        b.Entity<Product>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Title).HasMaxLength(256).IsRequired();
            e.Property(x => x.EnglishTitle).HasMaxLength(256);
            e.Property(x => x.Slug).HasMaxLength(256).IsRequired();
            e.Property(x => x.Sku).HasMaxLength(100);

            e.HasOne(x => x.Brand)
             .WithMany(bd => bd.Products)
             .HasForeignKey(x => x.BrandId)
             .OnDelete(DeleteBehavior.SetNull);

            // SEO
            e.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
            });

            // مالک محصول
            e.HasOne(x => x.OwnerVendor)
             .WithMany(v => v.OwnedProducts)
             .HasForeignKey(x => x.OwnerVendorId)
             .OnDelete(DeleteBehavior.SetNull);

            // Brand
            e.HasOne(x => x.Brand)
             .WithMany(bd => bd.Products)
             .HasForeignKey(x => x.BrandId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== ProductCategory (many-to-many with payload)
        b.Entity<ProductCategoryAssignment>(e =>
        {
            e.HasKey(x => new { x.ProductId, x.CatalogCategoryId });
            e.HasOne(x => x.Product)
             .WithMany(p => p.ProductCategoryAssignments)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Category)
             .WithMany(c => c.ProductCategoryAssignments)
             .HasForeignKey(x => x.CatalogCategoryId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== ProductMedia
        b.Entity<ProductMedia>(e =>
        {
            e.Property(x => x.Url).HasMaxLength(1024).IsRequired();
            e.Property(x => x.ThumbnailUrl).HasMaxLength(1024);
            e.Property(x => x.AltText).HasMaxLength(256);
            e.HasOne(x => x.Product)
             .WithMany(p => p.ProductMedia)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== Tags & ProductTag
        b.Entity<Tag>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(160).IsRequired();

            e.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
            });
        });

        b.Entity<ProductTag>(e =>
        {
            e.HasKey(x => new { x.ProductId, x.TagId });
            e.HasOne(x => x.Product)
             .WithMany(p => p.ProductTags)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Tag)
             .WithMany(t => t.ProductTags)
             .HasForeignKey(x => x.TagId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // تب‌های محتوایی
        b.Entity<ProductContentTab>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Product)
                .WithMany(p => p.ContentTabs)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ویژگی‌های برجسته
        b.Entity<ProductFeature>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Value).HasMaxLength(1000);
            e.HasOne(x => x.Product)
                .WithMany(p => p.Features)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== MediaAsset
        b.Entity<MediaAsset>(e =>
        {
            e.Property(x => x.FileName).HasMaxLength(260).IsRequired();
            e.Property(x => x.Url).HasMaxLength(1024).IsRequired();
            e.Property(x => x.ThumbnailUrl).HasMaxLength(1024);
            e.Property(x => x.AltText).HasMaxLength(256);
            e.Property(x => x.ContentType).HasMaxLength(100);
            e.Property(x => x.RelatedEntityType).HasMaxLength(100);
            e.Property(x => x.Title).HasMaxLength(256);

            e.HasIndex(x => new { x.Usage, x.Kind });
        });

        // ==== AttributeSet
        b.Entity<AttributeSet>(e =>
        {
            e.Property(x => x.Name)
                   .HasMaxLength(200)
                   .IsRequired();

            e.Property(x => x.Description)
                   .HasMaxLength(500);

            e.HasMany(x => x.Groups)
                   .WithOne(g => g.AttributeSet)
                   .HasForeignKey(g => g.AttributeSetId)
                   .OnDelete(DeleteBehavior.Cascade);

        });


        // ==== AttributeGroup 
        b.Entity<AttributeGroup>(e =>
        {
            e.Property(x => x.Name)
                   .HasMaxLength(200)
                   .IsRequired();

            e.Property(x => x.SortOrder)
                   .HasDefaultValue(0);

            e.HasIndex(x => new { x.AttributeSetId, x.SortOrder });

            e.HasMany(x => x.Attributes)
                   .WithOne(a => a.AttributeGroup)
                   .HasForeignKey(a => a.AttributeGroupId)
                   .OnDelete(DeleteBehavior.Cascade);

        });


        // ==== ProductAttribute  
        b.Entity<ProductAttribute>(e =>
        {
            e.Property(x => x.Name)
                   .HasMaxLength(200)
                   .IsRequired();

            e.Property(x => x.Key)
                   .HasMaxLength(100)
                   .IsRequired();

            e.HasIndex(x => x.Key).IsUnique(); // اگر نمی‌خوای global unique باشه، می‌تونی محدود به AttributeSet کنی

            e.Property(x => x.Unit)
                   .HasMaxLength(50);

            e.Property(x => x.SortOrder)
                   .HasDefaultValue(0);

            e.Property(x => x.ValueType)
                   .HasConversion<byte>()      // ذخیره به صورت tinyint
                   .IsRequired();

            e.Property(x => x.IsRequired)
                   .HasDefaultValue(false);

            e.Property(x => x.IsVariantLevel)
                   .HasDefaultValue(false);

            e.Property(x => x.IsFilterable)
                   .HasDefaultValue(false);

            e.Property(x => x.IsComparable)
                   .HasDefaultValue(false);

            e.HasMany(x => x.Options)
                   .WithOne(o => o.Attribute)
                   .HasForeignKey(o => o.AttributeId)
                   .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(x => x.Values)
                   .WithOne(v => v.Attribute)
                   .HasForeignKey(v => v.AttributeId)
                   .OnDelete(DeleteBehavior.Restrict);

        });


        // ==== AttributeOption 
        b.Entity<AttributeOption>(e =>
        {
            e.Property(x => x.Value)
                   .HasMaxLength(200)
                   .IsRequired();

            e.Property(x => x.DisplayLabel)
                   .HasMaxLength(200);

            e.Property(x => x.SortOrder)
                   .HasDefaultValue(0);

            e.Property(x => x.IsDefault)
                   .HasDefaultValue(false);

            e.HasIndex(x => new { x.AttributeId, x.SortOrder });

            e.HasMany(x => x.AttributeValues)
                   .WithOne(v => v.Option)
                   .HasForeignKey(v => v.OptionId)
                   .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== ProductAttributeValue 
        b.Entity<ProductAttributeValue>(e =>
        {
            e.Property(x => x.RawValue)
                           .HasMaxLength(1000);

            e.Property(x => x.NumericValue)
                   .HasPrecision(18, 4);

            e.Property(x => x.BoolValue);
            e.Property(x => x.DateTimeValue);

            e.Property(x => x.DisplayOrder)
                   .HasDefaultValue(0);

            e.Property(x => x.RowVersion)
                   .IsRowVersion();

            e.HasIndex(x => new { x.ProductId, x.AttributeId });

            e.HasOne(x => x.Product)
                   .WithMany(p => p.AttributeValues)
                   .HasForeignKey(x => x.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.AttributeGroup)
             .WithMany()
             .HasForeignKey(x => x.AttributeGroupId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<ProductVariant>(e =>
        {
            e.Property(x => x.VariantCode)
             .HasMaxLength(100)
             .IsRequired();

            e.HasOne(x => x.Product)
             .WithMany(p => p.Variants)
             .HasForeignKey(x => x.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });


        b.Entity<ProductVariantAttributeValue>(e =>
        {
            e.Property(x => x.RawValue)
             .HasMaxLength(1000);

            e.Property(x => x.NumericValue)
             .HasPrecision(18, 4);

            e.Property(x => x.DisplayOrder)
             .HasDefaultValue(0);

            e.Property(x => x.RowVersion)
             .IsRowVersion();

            // هر Variant برای هر Attribute فقط یک مقدار داشته باشد
            e.HasIndex(x => new { x.ProductVariantId, x.AttributeId })
             .IsUnique();

            e.HasOne(x => x.ProductVariant)
             .WithMany(v => v.AttributeValues)
             .HasForeignKey(x => x.ProductVariantId)
             .OnDelete(DeleteBehavior.Cascade);
        });



        b.Entity<Vendor>(e =>
        {
            e.Property(x => x.StoreName)
             .HasMaxLength(256)
             .IsRequired();

            e.Property(x => x.LegalName)
             .HasMaxLength(256);

            e.Property(x => x.NationalId)
             .HasMaxLength(50);

            e.Property(x => x.PhoneNumber)
             .HasMaxLength(50);

            e.Property(x => x.MobileNumber)
             .HasMaxLength(50);

            e.Property(x => x.DefaultCommissionPercent)
             .HasPrecision(5, 2);

            e.HasQueryFilter(x => x.Status);
        });


        b.Entity<VendorOfferVariant>(e =>
        {
            e.Property(x => x.Price)
             .HasPrecision(18, 2);

            e.HasIndex(x => new { x.VendorOfferId, x.ProductVariantId })
             .IsUnique();

            e.HasOne(x => x.VendorOffer)
             .WithMany(o => o.Variants)
             .HasForeignKey(x => x.VendorOfferId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.ProductVariant)
             .WithMany(v => v.VendorOfferVariants)
             .HasForeignKey(x => x.ProductVariantId)
             .OnDelete(DeleteBehavior.Restrict); // تغییر از Cascade به Restrict برای جلوگیری از cascade cycle
        });


        // ==== Role
        b.Entity<Role>(e =>
        {
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        // ==== Permission
        b.Entity<Permission>(e =>
        {
            e.HasIndex(x => x.Name).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.DisplayName).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Category).HasMaxLength(100);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        // ==== RolePermission (many-to-many)
        b.Entity<RolePermission>(e =>
        {
            e.HasKey(x => new { x.RoleId, x.PermissionId });
            e.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
            e.HasOne(x => x.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(x => x.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasQueryFilter(x => !x.IsDeleted);
        });

        // ==== User
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256).IsRequired();
            e.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
            e.Property(x => x.PhoneNumber).HasMaxLength(50);
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.EmailVerificationToken).HasMaxLength(500);
            e.Property(x => x.PasswordResetToken).HasMaxLength(500);
            
            e.Property(x => x.Role)
                .HasConversion<byte>()
                .IsRequired();
            
            e.HasOne(x => x.UserRole)
                .WithMany(r => r.Users)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.SetNull);
           
            
            e.HasQueryFilter(x => !x.IsDeleted);
            e.Property(x => x.RowVersion).IsRowVersion();
        });


        // ==== Vendor
        b.Entity<Vendor>().HasData(new Vendor
        {
            Id = MarketplaceConstants.DefaultMarketplaceVendorId,
            StoreName = "فروشگاه اصلی",
            CreatedAtUtc = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), // مقدار ثابت برای Migration
            IsDeleted = false,
            Status = true
        });

        // ==== Cart
        b.Entity<Cart>(e =>
        {
            e.HasOne(x => x.User)
                .WithMany(u => u.Carts)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== CartItem
        b.Entity<CartItem>(e =>
        {
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.HasOne(x => x.Cart)
                .WithMany(c => c.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.VendorOffer)
                .WithMany()
                .HasForeignKey(x => x.VendorOfferId)
                .OnDelete(DeleteBehavior.NoAction);
            e.HasOne(x => x.ProductVariant)
                .WithMany()
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => new { x.CartId, x.VendorOfferId, x.ProductVariantId }).IsUnique();
        });

        // ==== ShippingAddress
        b.Entity<ShippingAddress>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(100).IsRequired();
            e.Property(x => x.Province).HasMaxLength(100).IsRequired();
            e.Property(x => x.City).HasMaxLength(100).IsRequired();
            e.Property(x => x.AddressLine).HasMaxLength(500).IsRequired();
            e.Property(x => x.PostalCode).HasMaxLength(20);
            e.HasOne(x => x.User)
                .WithMany(u => u.ShippingAddresses)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== Order
        b.Entity<Order>(e =>
        {
            e.HasIndex(x => x.OrderNumber).IsUnique();
            e.Property(x => x.OrderNumber).HasMaxLength(50).IsRequired();
            e.Property(x => x.SubTotal).HasPrecision(18, 2);
            e.Property(x => x.ShippingCost).HasPrecision(18, 2);
            e.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            e.Property(x => x.TaxAmount).HasPrecision(18, 2);
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.Property(x => x.Notes).HasMaxLength(1000);
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.ShippingAddress)
                .WithMany(sa => sa.Orders)
                .HasForeignKey(x => x.ShippingAddressId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Shipping)
                .WithOne(s => s.Order)
                .HasForeignKey<Shipping>(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== OrderItem
        b.Entity<OrderItem>(e =>
        {
            e.Property(x => x.ProductTitle).HasMaxLength(256).IsRequired();
            e.Property(x => x.VariantName).HasMaxLength(200);
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.TotalPrice).HasPrecision(18, 2);
            e.Property(x => x.CommissionAmount).HasPrecision(18, 2);
            e.HasOne(x => x.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.VendorOffer)
                .WithMany()
                .HasForeignKey(x => x.VendorOfferId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.ProductVariant)
                .WithMany()
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== Payment
        b.Entity<Payment>(e =>
        {
            e.Property(x => x.TransactionId).HasMaxLength(100).IsRequired();
            e.Property(x => x.ReferenceNumber).HasMaxLength(100);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.GatewayName).HasMaxLength(100);
            e.Property(x => x.FailureReason).HasMaxLength(500);
            e.Property(x => x.Method).HasConversion<byte>();
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.Order)
                .WithMany(o => o.Payments)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==== Shipping
        b.Entity<Shipping>(e =>
        {
            e.Property(x => x.TrackingNumber).HasMaxLength(100);
            e.Property(x => x.ShippingCompany).HasMaxLength(100);
            e.Property(x => x.ShippingMethod).HasMaxLength(100);
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.Order)
                .WithOne(o => o.Shipping)
                .HasForeignKey<Shipping>(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== Review
        b.Entity<Review>(e =>
        {
            e.Property(x => x.Rating).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Comment).HasMaxLength(2000);
            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.ProductId, x.UserId }); // هر کاربر یک نظر برای هر محصول
        });

        // ==== ProductQuestion
        b.Entity<ProductQuestion>(e =>
        {
            e.Property(x => x.Question).HasMaxLength(1000).IsRequired();
            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==== ProductAnswer
        b.Entity<ProductAnswer>(e =>
        {
            e.Property(x => x.Answer).HasMaxLength(2000).IsRequired();
            e.HasOne(x => x.Question)
                .WithMany(q => q.Answers)
                .HasForeignKey(x => x.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Vendor)
                .WithMany()
                .HasForeignKey(x => x.VendorId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== Coupon
        b.Entity<Coupon>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Code).HasMaxLength(50).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Value).HasPrecision(18, 2);
            e.Property(x => x.MinPurchaseAmount).HasPrecision(18, 2);
            e.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
            e.Property(x => x.Type).HasConversion<byte>();
        });

        // ==== CouponUsage
        b.Entity<CouponUsage>(e =>
        {
            e.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            e.HasOne(x => x.Coupon)
                .WithMany(c => c.Usages)
                .HasForeignKey(x => x.CouponId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==== Discount
        b.Entity<Discount>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Value).HasPrecision(18, 2);
            e.Property(x => x.MinPurchaseAmount).HasPrecision(18, 2);
            e.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
            e.Property(x => x.Type).HasConversion<byte>();
            e.HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Vendor)
                .WithMany()
                .HasForeignKey(x => x.VendorId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Brand)
                .WithMany()
                .HasForeignKey(x => x.BrandId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== Wishlist
        b.Entity<Wishlist>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== WishlistItem
        b.Entity<WishlistItem>(e =>
        {
            e.HasOne(x => x.Wishlist)
                .WithMany(w => w.Items)
                .HasForeignKey(x => x.WishlistId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product)
                    .WithMany()
                    .HasForeignKey(x => x.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.VendorOffer)
                .WithMany()
                .HasForeignKey(x => x.VendorOfferId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => new { x.WishlistId, x.ProductId, x.VendorOfferId }); // جلوگیری از تکراری
        });


        b.Entity<VendorOffer>(b =>
        {
            b.Property(x => x.RowVersion)
             .IsRowVersion()
             .IsConcurrencyToken()
             .ValueGeneratedOnAddOrUpdate();
        });

        // ==== Notification
        b.Entity<Notification>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Message).HasMaxLength(1000).IsRequired();
            e.Property(x => x.RelatedEntityType).HasMaxLength(50);
            e.Property(x => x.ActionUrl).HasMaxLength(500);
            e.Property(x => x.Type).HasConversion<byte>();
            e.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.UserId, x.IsRead });
        });

        // ==== VendorWallet
        b.Entity<VendorWallet>(e =>
        {
            e.Property(x => x.Balance).HasPrecision(18, 2);
            e.Property(x => x.PendingBalance).HasPrecision(18, 2);
            e.Property(x => x.TotalEarnings).HasPrecision(18, 2);
            e.Property(x => x.TotalWithdrawn).HasPrecision(18, 2);
            e.HasOne(x => x.Vendor)
                .WithOne()
                .HasForeignKey<VendorWallet>(w => w.VendorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== VendorTransaction
        b.Entity<VendorTransaction>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.BalanceAfter).HasPrecision(18, 2);
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.ReferenceNumber).HasMaxLength(100);
            e.Property(x => x.Type).HasConversion<byte>();
            e.HasOne(x => x.Wallet)
                .WithMany(w => w.Transactions)
                .HasForeignKey(x => x.VendorWalletId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ==== VendorPayout
        b.Entity<VendorPayout>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.BankAccountInfo).HasMaxLength(500);
            e.Property(x => x.BankName).HasMaxLength(200);
            e.Property(x => x.AccountNumber).HasMaxLength(50);
            e.Property(x => x.ShabaNumber).HasMaxLength(26);
            e.Property(x => x.AdminNotes).HasMaxLength(1000);
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.Vendor)
                .WithMany()
                .HasForeignKey(x => x.VendorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ==== ReturnRequest
        b.Entity<ReturnRequest>(e =>
        {
            e.Property(x => x.Reason).HasMaxLength(500).IsRequired();
            e.Property(x => x.Description).HasMaxLength(1000);
            e.Property(x => x.AdminNotes).HasMaxLength(1000);
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.OrderItem)
                .WithMany()
                .HasForeignKey(x => x.OrderItemId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Refund)
                .WithOne(r => r.ReturnRequest)
                .HasForeignKey<Refund>(r => r.ReturnRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ==== Refund
        b.Entity<Refund>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.TransactionId).HasMaxLength(100);
            e.Property(x => x.FailureReason).HasMaxLength(500);
            e.Property(x => x.Status).HasConversion<byte>();
            e.HasOne(x => x.ReturnRequest)
                .WithOne(rr => rr.Refund)
                .HasForeignKey<Refund>(r => r.ReturnRequestId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Payment)
                .WithMany()
                .HasForeignKey(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        //vendor membership
        b.Entity<VendorMember>(e =>
        {
            e.Property(x => x.Role)
                .HasMaxLength(50);

            e.HasOne(x => x.Vendor)
                .WithMany(v => v.Members)
                .HasForeignKey(x => x.VendorId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.User)
                .WithMany(u => u.VendorMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });



        b.Entity<BlogPost>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Slug).IsRequired().HasMaxLength(300);
            b.HasIndex(x => x.Slug).IsUnique();
            b.HasQueryFilter(x => !x.IsDeleted);
            b.HasOne(x => x.ThumbnailMedia)
             .WithMany()
             .HasForeignKey(x => x.ThumbnailMediaId)
             .OnDelete(DeleteBehavior.SetNull);

            b.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.SeoMetaRobots).HasMaxLength(64);
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);

                se.Property(p => p.SeoSchemaJson).HasColumnType("nvarchar(max)");
            });
        });

        b.Entity<BlogCategory>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.Name).IsRequired().HasMaxLength(200);
            c.Property(x => x.Slug).IsRequired().HasMaxLength(300);

            c.HasIndex(x => x.Slug).IsUnique();

            c.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            c.HasQueryFilter(x => !x.IsDeleted);

            c.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
                se.Property(p => p.SeoMetaRobots).HasMaxLength(64);
                se.Property(p => p.SeoSchemaJson).HasColumnType("nvarchar(max)");
            });
        });

        b.Entity<BlogTag>(t =>
        {
            t.HasKey(x => x.Id);
            t.Property(x => x.Name).IsRequired().HasMaxLength(200);
            t.Property(x => x.Slug).IsRequired().HasMaxLength(300);
            t.HasIndex(x => x.Slug).IsUnique();

            t.HasQueryFilter(x => !x.IsDeleted);

            t.OwnsOne(x => x.Seo, se =>
            {
                se.Property(p => p.MetaTitle).HasMaxLength(512);
                se.Property(p => p.MetaDescription).HasMaxLength(2000);
                se.Property(p => p.CanonicalUrl).HasMaxLength(1024);
                se.Property(p => p.Keywords).HasMaxLength(2048);
                se.Property(p => p.SeoMetaRobots).HasMaxLength(64);
                se.Property(p => p.SeoSchemaJson).HasColumnType("nvarchar(max)");
            });
        });

        b.Entity<BlogPostCategory>(pc =>
        {
            pc.HasKey(x => new { x.PostId, x.CategoryId });

            pc.HasOne(x => x.Post)
              .WithMany(x => x.PostCategories)
              .HasForeignKey(x => x.PostId);

            pc.HasOne(x => x.Category)
              .WithMany(x => x.PostCategories)
              .HasForeignKey(x => x.CategoryId);
        });

        b.Entity<BlogPostTag>(pt =>
        {
            pt.HasKey(x => new { x.PostId, x.TagId });

            pt.HasOne(x => x.Post)
              .WithMany(x => x.PostTags)
              .HasForeignKey(x => x.PostId);

            pt.HasOne(x => x.Tag)
              .WithMany(x => x.PostTags)
              .HasForeignKey(x => x.TagId);
        });

        b.Entity<AuditLog>(b =>
        {
            b.HasIndex(x => x.CreatedAtUtc);
            b.HasIndex(x => x.UserId);
            b.HasIndex(x => x.Path);
        });

        b.Entity<StoreSettings>(b =>
        {
            b.HasQueryFilter(x => !x.IsDeleted);
            b.Property(x => x.RowVersion).IsRowVersion();
        });

        b.Entity<ShippingMethod>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Code).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.DefaultPrice).HasPrecision(18, 2);
        });

        b.Entity<ShippingZone>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.CountryCode).HasMaxLength(10);
            e.Property(x => x.Province).HasMaxLength(100);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.PostalCodePattern).HasMaxLength(200);
        });

        b.Entity<ShippingZoneRate>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.Property(x => x.MinOrderAmount).HasPrecision(18, 2);
            e.Property(x => x.FreeShippingMinOrderAmount).HasPrecision(18, 2);

            e.HasIndex(x => new { x.ShippingZoneId, x.ShippingMethodId }).IsUnique();

            e.HasOne(x => x.ShippingZone)
              .WithMany(z => z.Rates)
              .HasForeignKey(x => x.ShippingZoneId)
              .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.ShippingMethod)
              .WithMany()
              .HasForeignKey(x => x.ShippingMethodId)
              .OnDelete(DeleteBehavior.Restrict);
        });


        b.Entity<ExternalIdMap>(e =>
        {
            e.Property(x => x.Provider).HasMaxLength(100).IsRequired();
            e.Property(x => x.EntityType).HasMaxLength(50).IsRequired();
            e.Property(x => x.ExternalId).HasMaxLength(256).IsRequired();
            e.Property(x => x.ExternalSlug).HasMaxLength(256);

            e.HasIndex(x => new { x.Provider, x.EntityType, x.ExternalId }).IsUnique();
        });


        b.Entity<HomeBanner>(b =>
        {
            b.ToTable("HomeBanners");

            b.Property(x => x.LinkUrl).HasMaxLength(2048);
            b.Property(x => x.Title).HasMaxLength(256);
            b.Property(x => x.AltText).HasMaxLength(256);

            b.HasOne(x => x.MediaAsset)
                .WithMany()
                .HasForeignKey(x => x.MediaAssetId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.IsDeleted, x.IsActive, x.SortOrder });
        });



        b.Entity<QuickService>(b =>
        {
            b.ToTable("QuickServices");

            b.Property(x => x.Title).HasMaxLength(128).IsRequired();
            b.Property(x => x.LinkUrl).HasMaxLength(2048);

            b.HasOne(x => x.MediaAsset)
                .WithMany()
                .HasForeignKey(x => x.MediaAssetId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => new { x.IsDeleted, x.IsActive, x.SortOrder });
        });


        // ==== HomeTemplate
        b.Entity<HomeTemplate>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(2000);

            e.HasIndex(x => x.Slug).IsUnique();

            e.HasOne(x => x.ThumbnailMediaAsset)
                .WithMany()
                .HasForeignKey(x => x.ThumbnailMediaAssetId)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasMany(x => x.Sections)
                .WithOne(s => s.HomeTemplate)
                .HasForeignKey(s => s.HomeTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ==== HomeTemplateSection
        b.Entity<HomeTemplateSection>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.ConfigJson).HasColumnType("nvarchar(max)").IsRequired();
            e.HasIndex(x => new { x.HomeTemplateId, x.SortOrder })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        });


    }
}
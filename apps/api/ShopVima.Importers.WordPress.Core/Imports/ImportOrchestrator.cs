namespace ShopVima.Importers.WordPress.Core.Imports;

public sealed class ImportOrchestrator
{
    private readonly ProductCatalogImport _productCatalog;
    private readonly ProductsImport _products;
    private readonly BlogImport _blog;
    private readonly BlogImagesImport _blogImages;
    private readonly UsersImport _users;
    private readonly VendorsImport _vendors;
    private readonly ProductVendorLinkImport _productVendorLink;
    private readonly RepairVendorMembersImport _repairVendorMembers;

    public ImportOrchestrator(
        ProductCatalogImport productCatalog,
        ProductsImport products,
        BlogImport blog,
        BlogImagesImport blogImages,
        UsersImport users,
        VendorsImport vendors,
        ProductVendorLinkImport productVendorLink,
        RepairVendorMembersImport repairVendorMembers)
    {
        _productCatalog = productCatalog;
        _products = products;
        _blog = blog;
        _blogImages = blogImages;
        _users = users;
        _vendors = vendors;
        _productVendorLink = productVendorLink;
        _repairVendorMembers = repairVendorMembers;
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        //await _productCatalog.RunAsync(ct);
        //await _products.RunAsync(ct);
        //await _blog.RunAsync(ct);        
        //await _blogImages.RunAsync(ct); 
        //await _users.RunAsync(ct);
        //await _vendors.RunAsync(ct);
        //await _productVendorLink.RunAsync(ct);

        await _repairVendorMembers.RunAsync(ct);
    }
}
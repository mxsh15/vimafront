using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFieldsInEntities1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Excerpt",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "OldPrice",
                table: "VendorOfferVariants",
                newName: "DiscountPrice");

            migrationBuilder.RenameColumn(
                name: "OldPrice",
                table: "VendorOffers",
                newName: "DiscountPrice");

            migrationBuilder.RenameColumn(
                name: "ReviewHtml",
                table: "Products",
                newName: "ShortTitle");

            migrationBuilder.RenameColumn(
                name: "GuideHtml",
                table: "Products",
                newName: "Seo_SeoSchemaJson");

            migrationBuilder.RenameColumn(
                name: "EnableQnA",
                table: "Products",
                newName: "AllowCustomerReviews");

            migrationBuilder.RenameColumn(
                name: "EnableComments",
                table: "Products",
                newName: "AllowCustomerQuestions");

            migrationBuilder.RenameColumn(
                name: "AdditionalNotes",
                table: "Products",
                newName: "Seo_SeoMetaRobots");

            migrationBuilder.AddColumn<int>(
                name: "QuestionCount",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "RatingAverage",
                table: "Products",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "RatingCount",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReviewCount",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "SalesCount",
                table: "Products",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "ViewCount",
                table: "Products",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "CatalogCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoSchemaJson",
                table: "CatalogCategories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "Brands",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoSchemaJson",
                table: "Brands",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuestionCount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RatingAverage",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RatingCount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ReviewCount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SalesCount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Seo_SeoMetaRobots",
                table: "CatalogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_SeoSchemaJson",
                table: "CatalogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_SeoMetaRobots",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "Seo_SeoSchemaJson",
                table: "Brands");

            migrationBuilder.RenameColumn(
                name: "DiscountPrice",
                table: "VendorOfferVariants",
                newName: "OldPrice");

            migrationBuilder.RenameColumn(
                name: "DiscountPrice",
                table: "VendorOffers",
                newName: "OldPrice");

            migrationBuilder.RenameColumn(
                name: "ShortTitle",
                table: "Products",
                newName: "ReviewHtml");

            migrationBuilder.RenameColumn(
                name: "Seo_SeoSchemaJson",
                table: "Products",
                newName: "GuideHtml");

            migrationBuilder.RenameColumn(
                name: "Seo_SeoMetaRobots",
                table: "Products",
                newName: "AdditionalNotes");

            migrationBuilder.RenameColumn(
                name: "AllowCustomerReviews",
                table: "Products",
                newName: "EnableQnA");

            migrationBuilder.RenameColumn(
                name: "AllowCustomerQuestions",
                table: "Products",
                newName: "EnableComments");

            migrationBuilder.AddColumn<string>(
                name: "Excerpt",
                table: "Products",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}

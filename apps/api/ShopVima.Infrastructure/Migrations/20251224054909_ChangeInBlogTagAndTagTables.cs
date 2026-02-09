using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeInBlogTagAndTagTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tags",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateHeadTags",
                table: "Tags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateSnippet",
                table: "Tags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_CanonicalUrl",
                table: "Tags",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_IncludeInSitemap",
                table: "Tags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_Keywords",
                table: "Tags",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaDescription",
                table: "Tags",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaTitle",
                table: "Tags",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "Tags",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoSchemaJson",
                table: "Tags",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "BlogTags",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateHeadTags",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateSnippet",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_CanonicalUrl",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_IncludeInSitemap",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_Keywords",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_MetaDescription",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_MetaTitle",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_SeoMetaRobots",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Seo_SeoSchemaJson",
                table: "Tags");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "BlogTags");
        }
    }
}

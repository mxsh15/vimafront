using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeBlogCategoryAndBlogTagTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateHeadTags",
                table: "BlogTags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateSnippet",
                table: "BlogTags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_CanonicalUrl",
                table: "BlogTags",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_IncludeInSitemap",
                table: "BlogTags",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_Keywords",
                table: "BlogTags",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaDescription",
                table: "BlogTags",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaTitle",
                table: "BlogTags",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "BlogTags",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoSchemaJson",
                table: "BlogTags",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "BlogPosts",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_MetaTitle",
                table: "BlogPosts",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_MetaDescription",
                table: "BlogPosts",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_Keywords",
                table: "BlogPosts",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_CanonicalUrl",
                table: "BlogPosts",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateHeadTags",
                table: "BlogCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_AutoGenerateSnippet",
                table: "BlogCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_CanonicalUrl",
                table: "BlogCategories",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Seo_IncludeInSitemap",
                table: "BlogCategories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Seo_Keywords",
                table: "BlogCategories",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaDescription",
                table: "BlogCategories",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_MetaTitle",
                table: "BlogCategories",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "BlogCategories",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Seo_SeoSchemaJson",
                table: "BlogCategories",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateHeadTags",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateSnippet",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_CanonicalUrl",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_IncludeInSitemap",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_Keywords",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_MetaDescription",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_MetaTitle",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_SeoMetaRobots",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_SeoSchemaJson",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateHeadTags",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_AutoGenerateSnippet",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_CanonicalUrl",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_IncludeInSitemap",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_Keywords",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_MetaDescription",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_MetaTitle",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_SeoMetaRobots",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "Seo_SeoSchemaJson",
                table: "BlogCategories");

            migrationBuilder.AlterColumn<string>(
                name: "Seo_SeoMetaRobots",
                table: "BlogPosts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_MetaTitle",
                table: "BlogPosts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(160)",
                oldMaxLength: 160,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_MetaDescription",
                table: "BlogPosts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(320)",
                oldMaxLength: 320,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_Keywords",
                table: "BlogPosts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Seo_CanonicalUrl",
                table: "BlogPosts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512,
                oldNullable: true);
        }
    }
}

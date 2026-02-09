using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeNameCategoryProductTables2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Categories_ParentId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySpecGroups_Categories_CategoryId",
                table: "CategorySpecGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductCategories_Categories_CatalogCategoryId",
                table: "ProductCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductCategories_Products_ProductId",
                table: "ProductCategories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductCategories",
                table: "ProductCategories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.RenameTable(
                name: "ProductCategories",
                newName: "ProductCategoryAssignments");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "CatalogCategories");

            migrationBuilder.RenameIndex(
                name: "IX_ProductCategories_CatalogCategoryId",
                table: "ProductCategoryAssignments",
                newName: "IX_ProductCategoryAssignments_CatalogCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Categories_Slug",
                table: "CatalogCategories",
                newName: "IX_CatalogCategories_Slug");

            migrationBuilder.RenameIndex(
                name: "IX_Categories_ParentId",
                table: "CatalogCategories",
                newName: "IX_CatalogCategories_ParentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductCategoryAssignments",
                table: "ProductCategoryAssignments",
                columns: new[] { "ProductId", "CatalogCategoryId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_CatalogCategories",
                table: "CatalogCategories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CatalogCategories_CatalogCategories_ParentId",
                table: "CatalogCategories",
                column: "ParentId",
                principalTable: "CatalogCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySpecGroups_CatalogCategories_CategoryId",
                table: "CategorySpecGroups",
                column: "CategoryId",
                principalTable: "CatalogCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductCategoryAssignments_CatalogCategories_CatalogCategoryId",
                table: "ProductCategoryAssignments",
                column: "CatalogCategoryId",
                principalTable: "CatalogCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductCategoryAssignments_Products_ProductId",
                table: "ProductCategoryAssignments",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CatalogCategories_CatalogCategories_ParentId",
                table: "CatalogCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySpecGroups_CatalogCategories_CategoryId",
                table: "CategorySpecGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductCategoryAssignments_CatalogCategories_CatalogCategoryId",
                table: "ProductCategoryAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductCategoryAssignments_Products_ProductId",
                table: "ProductCategoryAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductCategoryAssignments",
                table: "ProductCategoryAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CatalogCategories",
                table: "CatalogCategories");

            migrationBuilder.RenameTable(
                name: "ProductCategoryAssignments",
                newName: "ProductCategories");

            migrationBuilder.RenameTable(
                name: "CatalogCategories",
                newName: "Categories");

            migrationBuilder.RenameIndex(
                name: "IX_ProductCategoryAssignments_CatalogCategoryId",
                table: "ProductCategories",
                newName: "IX_ProductCategories_CatalogCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_CatalogCategories_Slug",
                table: "Categories",
                newName: "IX_Categories_Slug");

            migrationBuilder.RenameIndex(
                name: "IX_CatalogCategories_ParentId",
                table: "Categories",
                newName: "IX_Categories_ParentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductCategories",
                table: "ProductCategories",
                columns: new[] { "ProductId", "CatalogCategoryId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Categories_ParentId",
                table: "Categories",
                column: "ParentId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySpecGroups_Categories_CategoryId",
                table: "CategorySpecGroups",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductCategories_Categories_CatalogCategoryId",
                table: "ProductCategories",
                column: "CatalogCategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductCategories_Products_ProductId",
                table: "ProductCategories",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

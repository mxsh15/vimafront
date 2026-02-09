using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeHomeTemplateSectionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HomeTemplateSections_HomeTemplateId_SortOrder",
                table: "HomeTemplateSections");

            migrationBuilder.CreateIndex(
                name: "IX_HomeTemplateSections_HomeTemplateId_SortOrder",
                table: "HomeTemplateSections",
                columns: new[] { "HomeTemplateId", "SortOrder" },
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HomeTemplateSections_HomeTemplateId_SortOrder",
                table: "HomeTemplateSections");

            migrationBuilder.CreateIndex(
                name: "IX_HomeTemplateSections_HomeTemplateId_SortOrder",
                table: "HomeTemplateSections",
                columns: new[] { "HomeTemplateId", "SortOrder" });
        }
    }
}

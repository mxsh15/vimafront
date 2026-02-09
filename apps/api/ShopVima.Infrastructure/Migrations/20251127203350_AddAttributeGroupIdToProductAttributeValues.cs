using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttributeGroupIdToProductAttributeValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AttributeGroupId",
                table: "ProductAttributeValues",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributeValues_AttributeGroupId",
                table: "ProductAttributeValues",
                column: "AttributeGroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductAttributeValues_AttributeGroups_AttributeGroupId",
                table: "ProductAttributeValues",
                column: "AttributeGroupId",
                principalTable: "AttributeGroups",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductAttributeValues_AttributeGroups_AttributeGroupId",
                table: "ProductAttributeValues");

            migrationBuilder.DropIndex(
                name: "IX_ProductAttributeValues_AttributeGroupId",
                table: "ProductAttributeValues");

            migrationBuilder.DropColumn(
                name: "AttributeGroupId",
                table: "ProductAttributeValues");
        }
    }
}

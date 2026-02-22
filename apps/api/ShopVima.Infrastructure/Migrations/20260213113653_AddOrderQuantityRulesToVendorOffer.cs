using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderQuantityRulesToVendorOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxOrderQuantity",
                table: "VendorOffers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinOrderQuantity",
                table: "VendorOffers",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "QuantityStep",
                table: "VendorOffers",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxOrderQuantity",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "MinOrderQuantity",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "QuantityStep",
                table: "VendorOffers");
        }
    }
}

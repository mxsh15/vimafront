using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFiledVendorOfferVariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "VendorOfferVariants",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "HeightCm",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LengthCm",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxOrderQuantity",
                table: "VendorOfferVariants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxVariablePrice",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinOrderQuantity",
                table: "VendorOfferVariants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "MinVariablePrice",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuantityStep",
                table: "VendorOfferVariants",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                table: "VendorOfferVariants",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "WeightKg",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WidthCm",
                table: "VendorOfferVariants",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "HeightCm",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "LengthCm",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "MaxOrderQuantity",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "MaxVariablePrice",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "MinOrderQuantity",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "MinVariablePrice",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "QuantityStep",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "WeightKg",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "WidthCm",
                table: "VendorOfferVariants");
        }
    }
}

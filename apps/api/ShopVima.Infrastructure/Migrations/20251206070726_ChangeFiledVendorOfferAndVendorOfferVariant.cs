using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeFiledVendorOfferAndVendorOfferVariant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomCommissionPercent",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "InquiryMobile",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "InquiryPhone",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "WarrantyTitle",
                table: "VendorOffers");

            migrationBuilder.AddColumn<byte>(
                name: "BackorderPolicy",
                table: "VendorOfferVariants",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<int>(
                name: "LowStockThreshold",
                table: "VendorOfferVariants",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ManageStock",
                table: "VendorOfferVariants",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte>(
                name: "StockStatus",
                table: "VendorOfferVariants",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<byte>(
                name: "BackorderPolicy",
                table: "VendorOffers",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<int>(
                name: "LowStockThreshold",
                table: "VendorOffers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ManageStock",
                table: "VendorOffers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<byte>(
                name: "StockStatus",
                table: "VendorOffers",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackorderPolicy",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "LowStockThreshold",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "ManageStock",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "StockStatus",
                table: "VendorOfferVariants");

            migrationBuilder.DropColumn(
                name: "BackorderPolicy",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "LowStockThreshold",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "ManageStock",
                table: "VendorOffers");

            migrationBuilder.DropColumn(
                name: "StockStatus",
                table: "VendorOffers");

            migrationBuilder.AddColumn<decimal>(
                name: "CustomCommissionPercent",
                table: "VendorOffers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InquiryMobile",
                table: "VendorOffers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InquiryPhone",
                table: "VendorOffers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyTitle",
                table: "VendorOffers",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

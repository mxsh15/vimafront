using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorOfferHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VendorOfferPriceHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendorOfferId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorOfferPriceHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorOfferPriceHistories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VendorOfferPriceHistories_VendorOffers_VendorOfferId",
                        column: x => x.VendorOfferId,
                        principalTable: "VendorOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VendorOfferPriceHistories_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VendorOfferPriceHistories_ProductId_CreatedAtUtc",
                table: "VendorOfferPriceHistories",
                columns: new[] { "ProductId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_VendorOfferPriceHistories_VendorId",
                table: "VendorOfferPriceHistories",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorOfferPriceHistories_VendorOfferId_CreatedAtUtc",
                table: "VendorOfferPriceHistories",
                columns: new[] { "VendorOfferId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VendorOfferPriceHistories");
        }
    }
}

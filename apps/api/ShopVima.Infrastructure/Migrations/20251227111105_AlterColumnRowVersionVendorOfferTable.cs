using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AlterColumnRowVersionVendorOfferTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) add new rowversion column
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion_tmp",
                table: "VendorOffers",
                type: "rowversion",
                rowVersion: true,
                nullable: false);

            // 2) drop old RowVersion (اگر constraint داشت، EF معمولاً خودش drop می‌کند، ولی این مطمئن‌تره)
            migrationBuilder.Sql(@"
DECLARE @dc sysname;
SELECT @dc = d.name
FROM sys.default_constraints d
JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
WHERE d.parent_object_id = OBJECT_ID(N'[dbo].[VendorOffers]') AND c.name = N'RowVersion';
IF @dc IS NOT NULL EXEC(N'ALTER TABLE [dbo].[VendorOffers] DROP CONSTRAINT [' + @dc + ']');
");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "VendorOffers");

            // 3) rename tmp -> RowVersion
            migrationBuilder.RenameColumn(
                name: "RowVersion_tmp",
                table: "VendorOffers",
                newName: "RowVersion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                    name: "RowVersion_tmp",
                    table: "VendorOffers",
                    type: "varbinary(8)",
                    nullable: false,
                    defaultValue: new byte[8]);

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "VendorOffers");

            migrationBuilder.RenameColumn(
                name: "RowVersion_tmp",
                table: "VendorOffers",
                newName: "RowVersion");
        }
    }
}

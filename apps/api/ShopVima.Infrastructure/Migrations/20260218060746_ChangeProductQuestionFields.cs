using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopVima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeProductQuestionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAtUtc",
                table: "ProductQuestions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedByUserId",
                table: "ProductQuestions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "ProductQuestions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAtUtc",
                table: "ProductQuestions");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                table: "ProductQuestions");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "ProductQuestions");
        }
    }
}

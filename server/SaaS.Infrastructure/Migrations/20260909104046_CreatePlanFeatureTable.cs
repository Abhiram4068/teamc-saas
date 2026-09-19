using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreatePlanFeatureTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "PlanFeatures",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PlanFeatures",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsEnabled",
                table: "PlanFeatures",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_PlanFeatures_PlanId_FeatureId",
                table: "PlanFeatures",
                columns: new[] { "PlanId", "FeatureId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures");

            migrationBuilder.DropIndex(
                name: "IX_PlanFeatures_PlanId_FeatureId",
                table: "PlanFeatures");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "PlanFeatures");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PlanFeatures");

            migrationBuilder.DropColumn(
                name: "IsEnabled",
                table: "PlanFeatures");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures",
                columns: new[] { "PlanId", "FeatureId" });
        }
    }
}

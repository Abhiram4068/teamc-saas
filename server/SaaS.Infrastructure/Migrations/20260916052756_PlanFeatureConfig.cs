using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PlanFeatureConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Features",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PlanFeatureConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanFeatureId = table.Column<int>(type: "int", nullable: false),
                    AccessValue = table.Column<bool>(type: "bit", nullable: true),
                    LimitValue = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanFeatureConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanFeatureConfigs_PlanFeatures_PlanFeatureId",
                        column: x => x.PlanFeatureId,
                        principalTable: "PlanFeatures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanFeatureConfigs_PlanFeatureId",
                table: "PlanFeatureConfigs",
                column: "PlanFeatureId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanFeatureConfigs");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Features");
        }
    }
}

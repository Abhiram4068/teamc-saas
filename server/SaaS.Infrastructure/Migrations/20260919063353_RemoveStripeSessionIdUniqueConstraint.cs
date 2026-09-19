using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SaaS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStripeSessionIdUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_StripeCheckoutSessionId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StripeCheckoutSessionId",
                table: "Payments",
                column: "StripeCheckoutSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_StripeCheckoutSessionId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StripeCheckoutSessionId",
                table: "Payments",
                column: "StripeCheckoutSessionId",
                unique: true);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamDraft.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueTeamPickOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE Picks p
                JOIN (
                    SELECT
                        PickId,
                        ROW_NUMBER() OVER (
                            PARTITION BY TeamId
                            ORDER BY CreatedAt, PickId
                        ) AS NewPickOrder
                    FROM Picks
                ) orderedPicks ON p.PickId = orderedPicks.PickId
                SET p.PickOrder = orderedPicks.NewPickOrder;
            """);

            migrationBuilder.CreateIndex(
                name: "IX_Picks_TeamId_PickOrder",
                table: "Picks",
                columns: new[] { "TeamId", "PickOrder" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Picks_TeamId_PickOrder",
                table: "Picks");
        }
    }
}

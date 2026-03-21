using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamDraft.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_LeaderUserId",
                table: "Teams",
                column: "LeaderUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Picks_ParticipantId",
                table: "Picks",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_Picks_TeamId",
                table: "Picks",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_AssignedTeamId",
                table: "Participants",
                column: "AssignedTeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_Participants_Teams_AssignedTeamId",
                table: "Participants",
                column: "AssignedTeamId",
                principalTable: "Teams",
                principalColumn: "TeamId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Picks_Participants_ParticipantId",
                table: "Picks",
                column: "ParticipantId",
                principalTable: "Participants",
                principalColumn: "ParticipantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Picks_Teams_TeamId",
                table: "Picks",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "TeamId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Users_LeaderUserId",
                table: "Teams",
                column: "LeaderUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Participants_Teams_AssignedTeamId",
                table: "Participants");

            migrationBuilder.DropForeignKey(
                name: "FK_Picks_Participants_ParticipantId",
                table: "Picks");

            migrationBuilder.DropForeignKey(
                name: "FK_Picks_Teams_TeamId",
                table: "Picks");

            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Users_LeaderUserId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Teams_LeaderUserId",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Picks_ParticipantId",
                table: "Picks");

            migrationBuilder.DropIndex(
                name: "IX_Picks_TeamId",
                table: "Picks");

            migrationBuilder.DropIndex(
                name: "IX_Participants_AssignedTeamId",
                table: "Participants");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}

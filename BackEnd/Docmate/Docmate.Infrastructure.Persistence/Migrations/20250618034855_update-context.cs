using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docmate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updatecontext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ChatConversations_ChatSessionId",
                table: "ChatMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChatConversations",
                table: "ChatConversations");

            migrationBuilder.RenameTable(
                name: "ChatConversations",
                newName: "ChatSessions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChatSessions",
                table: "ChatSessions",
                column: "ChatSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ChatSessions_ChatSessionId",
                table: "ChatMessages",
                column: "ChatSessionId",
                principalTable: "ChatSessions",
                principalColumn: "ChatSessionId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ChatSessions_ChatSessionId",
                table: "ChatMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChatSessions",
                table: "ChatSessions");

            migrationBuilder.RenameTable(
                name: "ChatSessions",
                newName: "ChatConversations");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChatConversations",
                table: "ChatConversations",
                column: "ChatSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ChatConversations_ChatSessionId",
                table: "ChatMessages",
                column: "ChatSessionId",
                principalTable: "ChatConversations",
                principalColumn: "ChatSessionId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

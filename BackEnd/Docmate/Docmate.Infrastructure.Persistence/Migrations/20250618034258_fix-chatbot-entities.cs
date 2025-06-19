using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docmate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class fixchatbotentities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ChatConversations_ConversationId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "Confidence",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "IsFromUser",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "EndedAt",
                table: "ChatConversations");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ChatConversations");

            migrationBuilder.DropColumn(
                name: "StartedAt",
                table: "ChatConversations");

            migrationBuilder.RenameColumn(
                name: "ConversationId",
                table: "ChatMessages",
                newName: "ChatSessionId");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "ChatMessages",
                newName: "UserMessage");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ChatMessages",
                newName: "ChatMessageId");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_ConversationId",
                table: "ChatMessages",
                newName: "IX_ChatMessages_ChatSessionId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ChatConversations",
                newName: "ChatSessionId");

            migrationBuilder.AddColumn<string>(
                name: "BotResponse",
                table: "ChatMessages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "ChatConversations",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                table: "ChatConversations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ChatConversations_ChatSessionId",
                table: "ChatMessages",
                column: "ChatSessionId",
                principalTable: "ChatConversations",
                principalColumn: "ChatSessionId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_ChatConversations_ChatSessionId",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "BotResponse",
                table: "ChatMessages");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "ChatConversations");

            migrationBuilder.RenameColumn(
                name: "UserMessage",
                table: "ChatMessages",
                newName: "Content");

            migrationBuilder.RenameColumn(
                name: "ChatSessionId",
                table: "ChatMessages",
                newName: "ConversationId");

            migrationBuilder.RenameColumn(
                name: "ChatMessageId",
                table: "ChatMessages",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_ChatMessages_ChatSessionId",
                table: "ChatMessages",
                newName: "IX_ChatMessages_ConversationId");

            migrationBuilder.RenameColumn(
                name: "ChatSessionId",
                table: "ChatConversations",
                newName: "Id");

            migrationBuilder.AddColumn<double>(
                name: "Confidence",
                table: "ChatMessages",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFromUser",
                table: "ChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "ChatConversations",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndedAt",
                table: "ChatConversations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ChatConversations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAt",
                table: "ChatConversations",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessages_ChatConversations_ConversationId",
                table: "ChatMessages",
                column: "ConversationId",
                principalTable: "ChatConversations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docmate.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updatedoctortable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAvailable",
                table: "Doctors",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAvailable",
                table: "Doctors");
        }
    }
}

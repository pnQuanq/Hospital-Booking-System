using System.ComponentModel.DataAnnotations;

namespace Docmate.Core.Contracts.Chat
{
    public class ChatMessageDto
    {
        [Required]
        public string Message { get; set; }
        public int? UserId { get; set; }
        public string? SessionId { get; set; }
    }
}

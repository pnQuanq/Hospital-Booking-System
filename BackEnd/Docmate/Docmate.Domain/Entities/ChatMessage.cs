using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class ChatMessage : BaseEntity
    {
        public int ChatMessageId { get; set; }
        public int ChatSessionId { get; set; }
        public string UserMessage { get; set; }
        public string BotResponse { get; set; }
        public DateTime Timestamp { get; set; }
        public virtual ChatSession ChatSession { get; set; }
    }
}

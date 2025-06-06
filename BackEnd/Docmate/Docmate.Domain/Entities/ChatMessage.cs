using Docmate.Core.Domain.Common;

namespace Docmate.Core.Domain.Entities
{
    public class ChatMessage : BaseEntity
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public string Content { get; set; }
        public bool IsFromUser { get; set; }
        public DateTime Timestamp { get; set; }
        public double? Confidence { get; set; }
        public ChatConversation Conversation { get; set; }
    }
}

namespace Docmate.Core.Contracts.Chat
{
    public class ChatHistoryDto
    {
        public string Message { get; set; }
        public string Response { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsFromUser { get; set; }
    }
}

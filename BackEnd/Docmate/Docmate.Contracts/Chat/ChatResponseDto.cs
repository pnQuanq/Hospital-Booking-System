namespace Docmate.Core.Contracts.Chat
{
    public class ChatResponseDto
    {
        public string Response { get; set; }
        public string? SessionId { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }
}

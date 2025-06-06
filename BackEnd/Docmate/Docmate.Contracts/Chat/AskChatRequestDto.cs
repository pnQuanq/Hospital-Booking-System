namespace Docmate.Core.Contracts.Chat
{
    public class AskChatRequestDto
    {
        public string Question { get; set; }
        public List<ChatMessageDto>? History { get; set; }
    }
}

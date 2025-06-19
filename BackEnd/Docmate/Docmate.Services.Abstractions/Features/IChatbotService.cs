using Docmate.Core.Contracts.Chat;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IChatbotService
    {
        Task<ChatResponseDto> ProcessMessageAsync(ChatMessageDto messageDto);
        Task<List<ChatHistoryDto>> GetChatHistoryAsync(string sessionId);
        Task<string> GenerateSessionIdAsync();
    }
}

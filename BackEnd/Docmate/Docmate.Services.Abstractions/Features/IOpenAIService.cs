using Docmate.Core.Contracts.Chat;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IOpenAIService
    {
        Task<string> AskChatbotAsync(string question, List<ChatMessageDto>? history = null);
    }
}

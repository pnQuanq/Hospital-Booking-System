using Docmate.Core.Contracts.Chat;
using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IOpenAIService
    {
        Task<string> GetChatCompletionAsync(string userMessage, string systemPrompt, List<ChatMessage> conversationHistory = null);
    }
}

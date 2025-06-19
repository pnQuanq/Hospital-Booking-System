using Docmate.Core.Domain.Entities;

namespace Docmate.Core.Domain.Repositories
{
    public interface IChatSessionRepository : IGenericRepository<ChatSession>
    {
        Task<ChatSession> GetBySessionIdAsync(string sessionId);
        Task<ChatSession> CreateSessionAsync(int? userId);
        Task<List<ChatMessage>> GetSessionMessagesAsync(string sessionId);
    }
}

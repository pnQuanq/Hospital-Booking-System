using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Infrastructure.Persistence.DataContext;
using Microsoft.EntityFrameworkCore;
using WeVibe.Infrastructure.Persistence.Repositories;

namespace Docmate.Infrastructure.Persistence.Repositories
{
    public class ChatSessionRepository : GenericRepository<ChatSession>, IChatSessionRepository
    {
        public ChatSessionRepository(ApplicationDbContext context) : base(context)
        {
        }
        public async Task<ChatSession> GetBySessionIdAsync(string sessionId)
        {
            return await _context.ChatSessions
                .Include(cs => cs.Messages)
                .FirstOrDefaultAsync(cs => cs.SessionId == sessionId);
        }

        public async Task<ChatSession> CreateSessionAsync(int? userId)
        {
            var session = new ChatSession
            {
                SessionId = $"chat_{Guid.NewGuid():N}_{DateTime.UtcNow:yyyyMMddHHmmss}",
                UserId = userId,
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }
        public async Task<List<ChatMessage>> GetSessionMessagesAsync(string sessionId)
        {
            return await _context.ChatMessages
                .Where(cm => cm.ChatSession.SessionId == sessionId)
                .OrderBy(cm => cm.Timestamp)
                .ToListAsync();
        }
    }
}

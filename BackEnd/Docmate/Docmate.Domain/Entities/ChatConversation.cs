using Docmate.Core.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Domain.Entities
{
    public class ChatConversation : BaseEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public bool IsActive { get; set; }
        public List<ChatMessage> Messages { get; set; } = new();
    }
}

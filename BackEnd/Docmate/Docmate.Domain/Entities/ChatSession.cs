using Docmate.Core.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docmate.Core.Domain.Entities
{
    public class ChatSession : BaseEntity
    {
        public int ChatSessionId { get; set; }
        public string SessionId { get; set; }
        public int? UserId { get; set; }
        public DateTime LastActiveAt { get; set; }
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}

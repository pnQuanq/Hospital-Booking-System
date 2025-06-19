using Docmate.Core.Contracts.Chat;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.Extensions.Logging;

namespace Docmate.Core.Services.Features
{
    public class ChatbotService : IChatbotService
    {
        private readonly IChatSessionRepository _chatSessionRepository;
        private readonly IOpenAIService _openAIService;
        private readonly IAppointmentService _appointmentService;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<ChatbotService> _logger;

        private const string SYSTEM_PROMPT = @"
You are a helpful hospital booking assistant for Docmate Hospital System. You can help users with:

1. Booking appointments - Ask for doctor preference, specialty, preferred date/time
2. Checking appointment status - Ask for appointment ID or patient details
3. Finding doctors and specialties - Provide information about available doctors
4. General hospital information - Hours, location, contact info, services

Guidelines:
- Be friendly, professional, and helpful
- Always ask for clarification if the user's request is unclear
- For appointment booking, collect: doctor/specialty preference, preferred date, preferred time
- For appointment status, ask for appointment ID or patient information
- Provide clear, concise responses
- If you cannot help with something, politely explain and suggest alternatives
- Keep responses conversational but informative

Hospital Information:
- Hours: Monday-Friday 8:00 AM - 8:00 PM, Saturday-Sunday 9:00 AM - 5:00 PM
- Emergency: 24/7
- Location: 123 Medical Center Drive, Healthcare City
- Phone: (555) 123-HEALTH

Remember to be empathetic as users may be dealing with health concerns.";

        public ChatbotService(
            IChatSessionRepository chatSessionRepository,
            IOpenAIService openAIService,
            IAppointmentService appointmentService,
            IDoctorRepository doctorRepository,
            ILogger<ChatbotService> logger)
        {
            _chatSessionRepository = chatSessionRepository;
            _openAIService = openAIService;
            _appointmentService = appointmentService;
            _doctorRepository = doctorRepository;
            _logger = logger;
        }
        public async Task<ChatResponseDto> ProcessMessageAsync(ChatMessageDto messageDto)
        {
            try
            {
                // Add null checks and logging to identify the issue
                _logger.LogInformation("ProcessMessageAsync started");

                if (messageDto == null)
                {
                    _logger.LogError("messageDto is null");
                    throw new ArgumentNullException(nameof(messageDto));
                }

                if (string.IsNullOrEmpty(messageDto.Message))
                {
                    _logger.LogError("messageDto.Message is null or empty");
                    throw new ArgumentException("Message cannot be null or empty", nameof(messageDto.Message));
                }

                _logger.LogInformation("Message received: {Message}, UserId: {UserId}, SessionId: {SessionId}",
                    messageDto.Message, messageDto.UserId, messageDto.SessionId);

                // Check if dependencies are injected properly
                if (_chatSessionRepository == null)
                {
                    _logger.LogError("_chatSessionRepository is null");
                    throw new InvalidOperationException("ChatSessionRepository is not properly injected");
                }

                if (_openAIService == null)
                {
                    _logger.LogError("_openAIService is null");
                    throw new InvalidOperationException("OpenAIService is not properly injected");
                }

                // Get or create chat session
                var sessionId = messageDto.SessionId ?? await GenerateSessionIdAsync();
                _logger.LogInformation("Generated/Using SessionId: {SessionId}", sessionId);

                var session = await _chatSessionRepository.GetBySessionIdAsync(sessionId);
                _logger.LogInformation("Session retrieved: {SessionExists}", session != null);

                if (session == null)
                {
                    _logger.LogInformation("Creating new session for UserId: {UserId}", messageDto.UserId);
                    session = await _chatSessionRepository.CreateSessionAsync(messageDto.UserId);

                    if (session == null)
                    {
                        _logger.LogError("Failed to create new session");
                        throw new InvalidOperationException("Failed to create chat session");
                    }

                    sessionId = session.SessionId;
                    _logger.LogInformation("New session created with SessionId: {SessionId}", sessionId);
                }

                // Ensure session has Messages collection initialized
                if (session.Messages == null)
                {
                    _logger.LogWarning("Session.Messages is null, initializing");
                    session.Messages = new List<Docmate.Core.Domain.Entities.ChatMessage>();
                }

                // Get conversation history for context
                _logger.LogInformation("Getting conversation history for SessionId: {SessionId}", sessionId);
                var conversationHistory = await _chatSessionRepository.GetSessionMessagesAsync(sessionId);

                if (conversationHistory == null)
                {
                    _logger.LogWarning("Conversation history is null, using empty list");
                    conversationHistory = new List<Docmate.Core.Domain.Entities.ChatMessage>();
                }

                _logger.LogInformation("Conversation history count: {Count}", conversationHistory.Count);

                // Check if the message requires specific data retrieval
                var enhancedContext = await GetContextualInformation(messageDto.Message, messageDto.UserId);
                var messageWithContext = enhancedContext != null
                    ? $"{messageDto.Message}\n\nContext: {enhancedContext}"
                    : messageDto.Message;

                _logger.LogInformation("Calling OpenAI service");

                // Get AI response
                var aiResponse = await _openAIService.GetChatCompletionAsync(
                    messageWithContext,
                    SYSTEM_PROMPT,
                    conversationHistory.TakeLast(10).ToList() // Limit context to last 10 messages
                );

                if (string.IsNullOrEmpty(aiResponse))
                {
                    _logger.LogWarning("AI response is null or empty");
                    aiResponse = "I'm sorry, I couldn't generate a response at the moment.";
                }

                _logger.LogInformation("AI response received: {ResponseLength} characters", aiResponse.Length);

                // Save the conversation - Use the correct ChatMessage type from Domain.Entities
                var chatMessage = new Docmate.Core.Domain.Entities.ChatMessage
                {
                    ChatSessionId = session.ChatSessionId,
                    UserMessage = messageDto.Message,
                    BotResponse = aiResponse,
                    Timestamp = DateTime.UtcNow
                };

                session.Messages.Add(chatMessage);
                session.LastActiveAt = DateTime.UtcNow;

                _logger.LogInformation("Updating session in repository");
                await _chatSessionRepository.UpdateAsync(session);

                _logger.LogInformation("ProcessMessageAsync completed successfully");

                return new ChatResponseDto
                {
                    Response = aiResponse,
                    SessionId = sessionId,
                    Success = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message: {Message}. Exception: {ExceptionType}, StackTrace: {StackTrace}",
                    messageDto?.Message, ex.GetType().Name, ex.StackTrace);

                return new ChatResponseDto
                {
                    Response = "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact our support team.",
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        private async Task<string> GetContextualInformation(string userMessage, int? userId)
        {
            var lowerMessage = userMessage.ToLower();

            try
            {
                // Check if user is asking about their appointments
                if ((lowerMessage.Contains("my appointment") || lowerMessage.Contains("appointment status") ||
                     lowerMessage.Contains("check appointment")) && userId.HasValue)
                {
                    var appointments = await _appointmentService.GetAppointmentsByPatientIdAsync(userId.Value);
                    if (appointments.Any())
                    {
                        var appointmentInfo = appointments.Select(a =>
                            $"Appointment ID: {a.AppointmentId}, Doctor: {a.DoctorName}, Date: {a.Date:yyyy-MM-dd HH:mm}, Status: {a.Status}");
                        return $"User's current appointments: {string.Join("; ", appointmentInfo)}";
                    }
                    return "User has no current appointments.";
                }

                // Check if user is asking about doctors/specialties
                if (lowerMessage.Contains("doctor") || lowerMessage.Contains("specialist") || lowerMessage.Contains("specialty"))
                {
                    // This would require implementing a method to get available doctors
                    // For now, return a general message
                    return "Available specialties include: Cardiology, Dermatology, Orthopedics, Pediatrics, Internal Medicine, and more.";
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error getting contextual information for message: {Message}", userMessage);
            }

            return null;
        }

        public async Task<List<ChatHistoryDto>> GetChatHistoryAsync(string sessionId)
        {
            var messages = await _chatSessionRepository.GetSessionMessagesAsync(sessionId);
            var history = new List<ChatHistoryDto>();

            foreach (var message in messages)
            {
                // Add user message
                history.Add(new ChatHistoryDto
                {
                    Message = message.UserMessage,
                    Response = "",
                    Timestamp = message.Timestamp,
                    IsFromUser = true
                });

                // Add bot response
                history.Add(new ChatHistoryDto
                {
                    Message = "",
                    Response = message.BotResponse,
                    Timestamp = message.Timestamp,
                    IsFromUser = false
                });
            }

            return history.OrderBy(h => h.Timestamp).ToList();
        }

        public async Task<string> GenerateSessionIdAsync()
        {
            return $"chat_{Guid.NewGuid():N}_{DateTime.UtcNow:yyyyMMddHHmmss}";
        }
    }
}
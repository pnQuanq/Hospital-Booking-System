using Docmate.Core.Contracts.Chat;
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
        private readonly ISpecialtyRepository _specialtyRepository;

        // Base URL for doctor details pages
        private const string DOCTOR_DETAILS_BASE_URL = "http://localhost:5173/doctor/doctor-details";

        private const string SYSTEM_PROMPT = @"
You are a helpful hospital booking assistant for Docmate Hospital System.

CRITICAL INSTRUCTION: When you receive information marked as 'Context:', 'IMPORTANT DATABASE INFORMATION:', or 'HOSPITAL DATABASE INFO:', you MUST use ONLY that information. Do NOT use your general knowledge about hospitals or medical specialties. The context provides real-time data from our hospital's database.

You can help users with:
1. Booking appointments - Ask for doctor preference, specialty, preferred date/time
2. Checking appointment status - Ask for appointment ID or patient details  
3. Finding doctors and specialties - Use ONLY the database information provided in context
4. General hospital information - Hours, location, contact info, services

Guidelines:
- When database context is provided, answer ONLY based on that context
- If asked about specialties and database info is provided, give the exact count and list from the database
- When providing doctor information, always include the doctor's detail page URL if provided in the context
- Be friendly, professional, and helpful
- Always ask for clarification if the user's request is unclear
- For appointment booking, collect: doctor/specialty preference, preferred date, preferred time
- For appointment status, ask for appointment ID or patient information
- Provide clear, concise responses
- If you cannot help with something, politely explain and suggest alternatives
- Keep responses conversational but informative
- When mentioning doctors, include their profile links for easy access

Hospital Information:
- Hours: Monday-Friday 7:00 AM - 5:00 PM
- Emergency: 24/7
- Location: 123 Hung Vuong Street, Ho Chi Minh City
- Phone: (89) 123-456-789

Remember to be empathetic as users may be dealing with health concerns.

REMINDER: If you see 'Context:' or 'DATABASE INFORMATION' in the user message, that is authoritative data from our hospital system. Use it instead of general knowledge.";

        public ChatbotService(
            IChatSessionRepository chatSessionRepository,
            IOpenAIService openAIService,
            IAppointmentService appointmentService,
            IDoctorRepository doctorRepository,
            ISpecialtyRepository specialtyRepository,
            ILogger<ChatbotService> logger)
        {
            _chatSessionRepository = chatSessionRepository;
            _openAIService = openAIService;
            _appointmentService = appointmentService;
            _doctorRepository = doctorRepository;
            _specialtyRepository = specialtyRepository;
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

            // LOG: Show what message we're processing
            _logger.LogInformation("GetContextualInformation called with message: '{Message}' (lowercase: '{LowerMessage}')", userMessage, lowerMessage);

            try
            {
                // Check if user is asking about their appointments
                if ((lowerMessage.Contains("my appointment") || lowerMessage.Contains("appointment status") ||
                     lowerMessage.Contains("check appointment")) && userId.HasValue)
                {
                    _logger.LogInformation("Processing appointment request for user {UserId}", userId.Value);
                    var appointments = await _appointmentService.GetAppointmentsByPatientIdAsync(userId.Value);
                    if (appointments.Any())
                    {
                        var appointmentInfo = appointments.Select(a =>
                            $"Appointment ID: {a.AppointmentId}, Doctor: {a.DoctorName}, Date: {a.Date:yyyy-MM-dd HH:mm}, Status: {a.Status}");
                        return $"User's current appointments: {string.Join("; ", appointmentInfo)}";
                    }
                    return "User has no current appointments.";
                }

                // Check if user is asking about doctors
                bool isDoctorQuery = lowerMessage.Contains("doctor") || lowerMessage.Contains("doctors") ||
                                    lowerMessage.Contains("physician") || lowerMessage.Contains("physicians") ||
                                    lowerMessage.Contains("find doctor") || lowerMessage.Contains("show me doctor") ||
                                    lowerMessage.Contains("available doctor") || lowerMessage.Contains("doctor information") ||
                                    lowerMessage.Contains("doctor details") || lowerMessage.Contains("who is the doctor") ||
                                    lowerMessage.Contains("tell me about doctor");

                _logger.LogInformation("Doctor query detected: {IsDoctorQuery}", isDoctorQuery);

                if (isDoctorQuery)
                {
                    _logger.LogInformation("Processing doctor request - calling _doctorRepository.GetAllAsync()");

                    try
                    {
                        var doctors = await _doctorRepository.GetAllWithSpecialtyAsync();

                        _logger.LogInformation("Doctors retrieved from database. Count: {Count}", doctors?.Count() ?? 0);

                        if (doctors != null && doctors.Any())
                        {
                            // Log each doctor for debugging
                            foreach (var doctor in doctors)
                            {
                                _logger.LogInformation("Doctor found: ID={Id}, Name='{Name}', Specialty='{Specialty}'",
                                    doctor.DoctorId, doctor.User.FullName, doctor.Specialty);
                            }

                            var doctorInfoList = doctors
                                .Where(d => !string.IsNullOrWhiteSpace(d.User.FullName))
                                .Select(d => new
                                {
                                    Name = d.User.FullName.Trim(),
                                    Specialty = d.Description?.Trim() ?? "General",
                                    Id = d.DoctorId,
                                    Url = $"{DOCTOR_DETAILS_BASE_URL}/{d.DoctorId}"
                                })
                                .OrderBy(d => d.Name)
                                .ToList();

                            _logger.LogInformation("Filtered doctor info count: {Count}", doctorInfoList.Count);

                            if (doctorInfoList.Any())
                            {
                                var doctorDetails = doctorInfoList.Select(d =>
                                    $"Dr. {d.Name} (Specialty: {d.Specialty}) - Profile: {d.Url}");

                                var contextMessage = $"IMPORTANT DATABASE INFORMATION: The hospital currently has {doctorInfoList.Count} doctors available: {string.Join("; ", doctorDetails)}. You MUST provide the profile URLs when mentioning doctors so patients can view their full details.";

                                _logger.LogInformation("Generated doctor context message: {Context}", contextMessage);
                                return contextMessage;
                            }
                            else
                            {
                                _logger.LogWarning("No valid doctor names found");
                                return "HOSPITAL DATABASE INFO: No valid doctor information found in our database.";
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Doctors collection is null or empty");
                            return "HOSPITAL DATABASE INFO: No doctors found in the database.";
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving doctors from database: {Message}", ex.Message);
                        return "DATABASE ERROR: Unable to retrieve current doctor information from our system.";
                    }
                }

                // Check if user is asking about specialties
                bool isSpecialtyQuery = lowerMessage.Contains("specialist") ||
                                       lowerMessage.Contains("specialty") || lowerMessage.Contains("specialties") ||
                                       lowerMessage.Contains("department") || lowerMessage.Contains("departments") ||
                                       lowerMessage.Contains("how many specialty") || lowerMessage.Contains("how many specialties") ||
                                       lowerMessage.Contains("what specialty") || lowerMessage.Contains("what specialties") ||
                                       lowerMessage.Contains("available specialty") || lowerMessage.Contains("available specialties");

                _logger.LogInformation("Specialty query detected: {IsSpecialtyQuery}", isSpecialtyQuery);

                if (isSpecialtyQuery)
                {
                    _logger.LogInformation("Processing specialty request - calling _specialtyRepository.GetAllAsync()");

                    try
                    {
                        var specialties = await _specialtyRepository.GetAllAsync();

                        _logger.LogInformation("Specialties retrieved from database. Count: {Count}", specialties?.Count() ?? 0);

                        if (specialties != null && specialties.Any())
                        {
                            // Log each specialty for debugging
                            foreach (var specialty in specialties)
                            {
                                _logger.LogInformation("Specialty found: ID={Id}, Description='{Description}'",
                                    specialty.SpecialtyId, specialty.Description);
                            }

                            var specialtyNames = specialties
                                .Where(s => !string.IsNullOrWhiteSpace(s.Description))
                                .Select(s => s.Description.Trim())
                                .OrderBy(s => s)
                                .ToList();

                            _logger.LogInformation("Filtered specialty names count: {Count}", specialtyNames.Count);

                            if (specialtyNames.Any())
                            {
                                var contextMessage = $"IMPORTANT DATABASE INFORMATION: The hospital currently has exactly {specialtyNames.Count} specialties in our database: {string.Join(", ", specialtyNames)}. You MUST use this exact number and list from our database, not general knowledge.";

                                _logger.LogInformation("Generated context message: {Context}", contextMessage);
                                return contextMessage;
                            }
                            else
                            {
                                _logger.LogWarning("No valid specialty descriptions found");
                                return "HOSPITAL DATABASE INFO: No valid specialties found in our database.";
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Specialties collection is null or empty");
                            return "HOSPITAL DATABASE INFO: No specialties found in the database.";
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error retrieving specialties from database: {Message}", ex.Message);
                        return "DATABASE ERROR: Unable to retrieve current specialties from our system.";
                    }
                }

                _logger.LogInformation("No matching conditions found, returning null");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetContextualInformation for message: {Message}", userMessage);
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
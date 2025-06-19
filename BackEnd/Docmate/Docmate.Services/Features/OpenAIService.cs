using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Docmate.Core.Services.Features
{
    public class OpenAIService : IOpenAIService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenAIService> _logger;
        private readonly string _apiKey;

        public OpenAIService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenAIService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _apiKey = _configuration["OpenAI:ApiKey"];

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<string> GetChatCompletionAsync(string userMessage, string systemPrompt, List<ChatMessage> conversationHistory = null)
        {
            try
            {
                var messages = new List<object>
                {
                    new { role = "system", content = systemPrompt }
                };

                // Add conversation history for context
                if (conversationHistory != null)
                {
                    foreach (var msg in conversationHistory)
                    {
                        messages.Add(new { role = "user", content = msg.UserMessage });
                        messages.Add(new { role = "assistant", content = msg.BotResponse });
                    }
                }

                // Add current user message
                messages.Add(new { role = "user", content = userMessage });

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = messages,
                    max_tokens = 500,
                    temperature = 0.7,
                    top_p = 1,
                    frequency_penalty = 0,
                    presence_penalty = 0
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("OpenAI API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                    throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var chatResponse = JsonSerializer.Deserialize<OpenAIChatResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                return chatResponse?.Choices?.FirstOrDefault()?.Message?.Content ??
                       "I'm sorry, I couldn't process your request at the moment.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                throw new InvalidOperationException("Failed to get AI response", ex);
            }
        }
    }

    // OpenAI Response Models
    public class OpenAIChatResponse
    {
        public List<ChatChoice> Choices { get; set; }
    }

    public class ChatChoice
    {
        public OpenAIChatMessage Message { get; set; }
    }

    public class OpenAIChatMessage
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }
}
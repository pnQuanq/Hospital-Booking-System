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
        private readonly string _model;
        private readonly int _maxTokens;
        private readonly double _temperature;

        public OpenAIService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenAIService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            // Load configuration values
            _apiKey = _configuration["OpenAI:ApiKey"];
            _model = _configuration["OpenAI:Model"] ?? "gpt-3.5-turbo";
            _maxTokens = _configuration.GetValue<int>("OpenAI:MaxTokens", 500);
            _temperature = _configuration.GetValue<double>("OpenAI:Temperature", 0.7);

            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new InvalidOperationException("OpenAI API Key is not configured");
            }

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
                    model = _model,
                    messages = messages,
                    max_tokens = _maxTokens,
                    temperature = _temperature,
                    top_p = _configuration.GetValue<double>("OpenAI:TopP", 1.0),
                    frequency_penalty = _configuration.GetValue<double>("OpenAI:FrequencyPenalty", 0.0),
                    presence_penalty = _configuration.GetValue<double>("OpenAI:PresencePenalty", 0.0)
                };

                var jsonContent = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _logger.LogDebug("Sending request to OpenAI API with model: {Model}", _model);

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

                var result = chatResponse?.Choices?.FirstOrDefault()?.Message?.Content ??
                           "I'm sorry, I couldn't process your request at the moment.";

                _logger.LogDebug("OpenAI API response received successfully");
                return result;
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
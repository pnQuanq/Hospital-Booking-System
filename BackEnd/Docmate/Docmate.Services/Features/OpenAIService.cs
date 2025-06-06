using Docmate.Core.Contracts.Chat;
using Docmate.Core.Services.Abstractions.Features;
using System.Net.Http.Json;
using System.Text.Json;

namespace Docmate.Core.Services.Features
{
    public class OpenAIService : IOpenAIService
    {
        private readonly string _apiKey = "YOUR_API_KEY";

        public async Task<string> AskChatbotAsync(string question, List<ChatMessageDto>? history = null)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var messages = new List<object>
        {
            new { role = "system", content = "You are a helpful medical assistant for a hospital." }
        };

            if (history != null)
            {
                foreach (var msg in history)
                    messages.Add(new { role = msg.IsFromUser ? "user" : "assistant", content = msg.Content });
            }

            messages.Add(new { role = "user", content = question });

            var request = new
            {
                model = "gpt-3.5-turbo",
                messages = messages,
                temperature = 0.2
            };

            var response = await httpClient.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", request);
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }
    }
}

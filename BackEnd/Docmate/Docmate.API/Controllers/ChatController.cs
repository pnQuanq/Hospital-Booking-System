using Docmate.Core.Contracts.Chat;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Mvc;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : Controller
    {
        private readonly IOpenAIService _openAIService;

        public ChatController(IOpenAIService openAIService)
        {
            _openAIService = openAIService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AskChatRequestDto request)
        {
            var response = await _openAIService.AskChatbotAsync(request.Question, request.History);
            return Ok(new { answer = response });
        }
    }
}

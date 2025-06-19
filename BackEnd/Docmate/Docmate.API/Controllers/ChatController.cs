using Docmate.Core.Contracts.Chat;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Mvc;

namespace Docmate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : Controller
    {
        private readonly IChatbotService _chatbotService;
        public ChatController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<ChatResponseDto>> Chat([FromBody] ChatMessageDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _chatbotService.ProcessMessageAsync(request);

                if (!response.Success)
                {
                    return StatusCode(500, response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ChatResponseDto
                {
                    Success = false,
                    ErrorMessage = "Internal server error",
                    Response = "I'm sorry, I'm experiencing technical difficulties. Please try again later."
                });
            }
        }

        [HttpGet("history/{sessionId}")]
        public async Task<ActionResult<List<ChatHistoryDto>>> GetChatHistory(string sessionId)
        {
            try
            {
                var history = await _chatbotService.GetChatHistoryAsync(sessionId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error retrieving chat history");
            }
        }
    }
}

using Docmate.Core.Contracts.Auth;
using Microsoft.AspNetCore.Identity;

namespace Docmate.Core.Services.Abstractions.Features
{
    public interface IAuthService
    {
        Task<IdentityResult> RegisterAsync(RegisterDto registerDto);
        Task<string> LoginAsync(LoginDto loginDto);
        Task LogoutAsync();
    }
}

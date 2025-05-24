using Docmate.Core.Contracts.Auth;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace Docmate.Core.Services.Features
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        public AuthService(UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }
        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                throw new UnauthorizedAccessException("Username or password not correct.");
            }

            var result = await _signInManager.PasswordSignInAsync(user, loginDto.Password, false, false);

            if (!result.Succeeded)
            {
                throw new UnauthorizedAccessException("Invalid login attempt.");
            }

            // Generate JWT Token
            return await _tokenService.GenerateAccessTokenAsync(user);
        }

        public Task LogoutAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<IdentityResult> RegisterAsync(RegisterDto registerDto)
        {
            if (!IsValidEmail(registerDto.Email))
            {
                return IdentityResult.Failed(new IdentityError { Description = "The email format is invalid." });
            }

            if (registerDto.Password != registerDto.RePassword)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Passwords do not match." });
            }

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FullName = registerDto.FullName
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            var roleResult = await _userManager.AddToRoleAsync(user, "Patient");

            if (!roleResult.Succeeded)
            {
                return IdentityResult.Failed(new IdentityError { Description = "Failed to assign Patient role." });
            }
            return result;
        }
        private bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }
    }
}

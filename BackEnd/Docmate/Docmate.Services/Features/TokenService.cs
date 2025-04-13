using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Services.Abstractions.Features;
using Docmate.Core.Domain.Common;

namespace Docmate.Core.Services.Features
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtSecurityTokenHandler _jwtSecurityTokenHandler = new JwtSecurityTokenHandler();

        public TokenService(IConfiguration configuration, UserManager<ApplicationUser> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
        }

        public async Task<string> GenerateAccessTokenAsync(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim("UserId", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("fullName", $"{user.Fullname}")
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim("Role", role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: credentials
            );

            return _jwtSecurityTokenHandler.WriteToken(token);
        }
        public async Task<string> GenerateRefreshTokenAsync(ApplicationUser user)
        {
            var refreshToken = new RefreshToken
            {
                UserId = user.Id.ToString(),
                Token = Guid.NewGuid().ToString(),
                ExpirationDate = DateTime.Now.AddMonths(1)
            };

            return refreshToken.Token;
        }

        public async Task<ClaimsPrincipal> GetPrincipalFromExpiredTokenAsync(string token)
        {
            try
            {
                var principal = _jwtSecurityTokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false, // We are allowing expired tokens to be valid
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]))
                }, out _);

                return principal;
            }
            catch (Exception)
            {
                return null;
            }
        }
        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var principal = _jwtSecurityTokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]))
                }, out _);

                return principal != null;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}

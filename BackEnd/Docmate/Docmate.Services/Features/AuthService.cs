using Docmate.Core.Contracts.Auth;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Docmate.Core.Services.Features
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IPatientRepository _patientRepository;
        public AuthService(UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            IPatientRepository patientRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _patientRepository = patientRepository;
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
            try
            {
                Console.WriteLine("Starting registration for email: " + registerDto.Email);

                if (!IsValidEmail(registerDto.Email))
                {
                    Console.WriteLine("Invalid email format.");
                    return IdentityResult.Failed(new IdentityError { Description = "The email format is invalid." });
                }

                if (registerDto.Password != registerDto.RePassword)
                {
                    Console.WriteLine("Passwords do not match.");
                    return IdentityResult.Failed(new IdentityError { Description = "Passwords do not match." });
                }

                var user = new ApplicationUser
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (!result.Succeeded)
                {
                    Console.WriteLine("User creation failed. Errors:");
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine($" - {error.Code}: {error.Description}");
                    }
                    return result;
                }

                Console.WriteLine("User created successfully. UserId: " + user.Id);

                var roleResult = await _userManager.AddToRoleAsync(user, "Patient");
                if (!roleResult.Succeeded)
                {
                    Console.WriteLine("Failed to assign Patient role. Errors:");
                    foreach (var error in roleResult.Errors)
                    {
                        Console.WriteLine($" - {error.Code}: {error.Description}");
                    }
                    return IdentityResult.Failed(new IdentityError { Description = "Failed to assign Patient role." });
                }

                Console.WriteLine("Assigned Patient role successfully.");

                var patient = new Patient
                {
                    UserId = user.Id,
                    // optionally initialize other properties if you want
                };

                await _patientRepository.AddAsync(patient);
                Console.WriteLine("Patient record created with UserId: " + patient.UserId);

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred during registration: " + ex.Message);
                throw;
            }
        }


        private bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }
    }
}

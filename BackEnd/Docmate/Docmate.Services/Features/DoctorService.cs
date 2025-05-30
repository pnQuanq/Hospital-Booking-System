﻿
using AutoMapper;
using Docmate.Core.Contracts.Doctor;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;
using Microsoft.EntityFrameworkCore;

namespace Docmate.Core.Services.Features
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        public DoctorService(IDoctorRepository doctorRepository,
                             IUserRepository userRepository,
                             IMapper mapper)
        {
            _doctorRepository = doctorRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }
        public async Task AddDoctorAsync(AddDoctorDto dto)
        {
            var doctor = new Doctor
            {
                User = new ApplicationUser
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    PasswordHash = dto.Password,
                    ImageUrl = dto.ImagePath ?? ""
                },
                ExperienceYears = dto.Experience,
                SpecialtyId = dto.SpecialtyId,
                Description = dto.Description,
                Rating = 0
            };

            await _doctorRepository.AddAsync(doctor);
        }
        public async Task<List<DoctorDto>> GetAllDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllWithSpecialtyAsync();

            return doctors.Select(d => new DoctorDto
            {
                DoctorId = d.DoctorId,
                FullName = d.User.FullName,
                Email = d.User.Email,
                ImageUrl = d.User.ImageUrl,

                SpecialtyId = d.SpecialtyId,
                SpecialtyDescription = d.Specialty?.Description,

                ExperienceYears = d.ExperienceYears,
                Description = d.Description,
                Rating = d.Rating,
                IsAvailable = d.IsAvailable,
            }).ToList();
        }
        public async Task<bool> UpdateDoctorAsync(UpdateDoctorDto dto)
        {
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(dto.DoctorId); // includes ApplicationUser

            if (doctor == null)
                return false;

            // Update user-related fields
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                doctor.User.FullName = dto.FullName;

            // Update doctor entity fields
            if (!string.IsNullOrWhiteSpace(dto.Description))
                doctor.Description = dto.Description;

            if (dto.SpecialtyId.HasValue)
                doctor.SpecialtyId = dto.SpecialtyId.Value;

            if (dto.ExperienceYears.HasValue)
                doctor.ExperienceYears = dto.ExperienceYears.Value;

            if (dto.IsAvailable.HasValue)
                doctor.IsAvailable = dto.IsAvailable.Value;

            await _doctorRepository.UpdateAsync(doctor);


            return true;
        }
        public async Task<List<DoctorDto>> GetTopDoctorsAsync()
        {
            var doctors = await _doctorRepository.GetAllWithSpecialtyAsync();

            var topDoctors = doctors
                .OrderByDescending(d => d.Rating * 0.3 + d.ExperienceYears * 0.7)
                .Take(10)
                .ToList();

            return _mapper.Map<List<DoctorDto>>(topDoctors);
        }
        public async Task<DoctorDto?> GetDoctorDetailsAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(userId);
            if (doctor == null) return null;

            return new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                FullName = doctor.User.FullName,
                Email = doctor.User.Email,
                ImageUrl = doctor.User.ImageUrl,

                SpecialtyId = doctor.SpecialtyId,
                SpecialtyDescription = doctor.Specialty?.Description,

                ExperienceYears = doctor.ExperienceYears,
                Description = doctor.Description,
                Rating = doctor.Rating,
                IsAvailable = doctor.IsAvailable,
            };
        }

    }
}

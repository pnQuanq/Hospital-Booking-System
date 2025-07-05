using AutoMapper;
using Docmate.Core.Contracts.Revierw;
using Docmate.Core.Domain.Entities;
using Docmate.Core.Domain.Repositories;
using Docmate.Core.Services.Abstractions.Features;

namespace Docmate.Core.Services.Features
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMapper _mapper;
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentService _appointmentService;

        public ReviewService(
            IReviewRepository reviewRepository,
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            IMapper mapper,
            IPatientRepository patientRepository,
            IAppointmentService appointmentService)
        {
            _reviewRepository = reviewRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _mapper = mapper;
            _patientRepository = patientRepository;
            _appointmentService = appointmentService;
        }

        public async Task<ReviewDto> CreateReviewAsync(CreateReviewDto dto, int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            // Validate if patient can review this appointment
            if (!await CanPatientReviewAsync(dto.AppointmentId, userId))
            {
                throw new InvalidOperationException("You are not authorized to review this appointment or the appointment is not eligible for review.");
            }

            // Check if review already exists for this appointment
            var existingReview = await _reviewRepository.GetByAppointmentIdAsync(dto.AppointmentId);
            if (existingReview != null)
            {
                throw new InvalidOperationException("A review already exists for this appointment.");
            }

            // Get appointment details
            var appointment = await _appointmentRepository.GetByIdWithDetailsAsync(dto.AppointmentId);
            if (appointment == null)
            {
                throw new InvalidOperationException("Appointment not found.");
            }

            // Create review
            var review = new Review
            {
                AppointmentId = dto.AppointmentId,
                PatientId = patient.PatientId,
                DoctorId = appointment.DoctorId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };
            await _appointmentService.UpdateAppointmentReviewAsync(dto.AppointmentId);

            await _reviewRepository.AddAsync(review);

            // Update doctor's average rating
            await UpdateDoctorRatingAsync(appointment.DoctorId);

            return await GetReviewByIdAsync(review.ReviewId);
        }
        public async Task<ReviewDto?> GetReviewByIdAsync(int reviewId)
        {
            var review = await _reviewRepository.GetByIdWithDetailsAsync(reviewId);
            if (review == null)
            {
                return null;
            }

            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                AppointmentId = review.AppointmentId,
                PatientId = review.PatientId,
                PatientName = review.Patient?.User?.FullName ?? "Unknown",
                DoctorId = review.DoctorId,
                DoctorName = review.Doctor?.User?.FullName ?? "Unknown",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.DateCreated?.ToString("dd-MM-yyyy"),
                UpdatedAt = review.DateModified?.ToString("dd-MM-yyyy"),
            };
        }

        public async Task<ReviewDto?> GetReviewByAppointmentIdAsync(int appointmentId)
        {
            var review = await _reviewRepository.GetByAppointmentIdWithDetailsAsync(appointmentId);
            if (review == null)
            {
                return null;
            }

            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                AppointmentId = review.AppointmentId,
                PatientId = review.PatientId,
                PatientName = review.Patient?.User?.FullName ?? "Unknown",
                DoctorId = review.DoctorId,
                DoctorName = review.Doctor?.User?.FullName ?? "Unknown",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.DateCreated?.ToString("dd-MM-yyyy"),
                UpdatedAt = review.DateModified?.ToString("dd-MM-yyyy"),
            };
        }

        public async Task<List<ReviewDto>> GetReviewsByPatientIdAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId);
            var reviews = await _reviewRepository.GetByPatientIdWithDetailsAsync(patient.PatientId);

            return reviews.Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                AppointmentId = r.AppointmentId,
                PatientId = r.PatientId,
                PatientName = r.Patient?.User?.FullName ?? "Unknown",
                DoctorId = r.DoctorId,
                DoctorName = r.Doctor?.User?.FullName ?? "Unknown",
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.DateCreated?.ToString("dd-MM-yyyy"),
                UpdatedAt = r.DateModified?.ToString("dd-MM-yyyy"),
            }).ToList();
        }

        public async Task<DoctorReviewSummaryDto> GetDoctorReviewsAsync(int doctorId, int page = 1, int pageSize = 10)
        {
            var doctor = await _doctorRepository.GetByIdWithUserAndSpecialtyAsync(doctorId);
            if (doctor == null)
            {
                throw new InvalidOperationException("Doctor not found.");
            }

            var reviews = await _reviewRepository.GetByDoctorIdWithDetailsAsync(doctorId, page, pageSize);
            var totalReviews = await _reviewRepository.GetTotalReviewsCountByDoctorIdAsync(doctorId);
            var averageRating = await _reviewRepository.GetAverageRatingByDoctorIdAsync(doctorId);

            return new DoctorReviewSummaryDto
            {
                DoctorId = doctorId,
                DoctorName = doctor.User?.FullName ?? "Unknown",
                AverageRating = averageRating,
                TotalReviews = totalReviews,
                Reviews = reviews.Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    AppointmentId = r.AppointmentId,
                    PatientId = r.PatientId,
                    PatientName = r.Patient?.User?.FullName ?? "Unknown",
                    DoctorId = r.DoctorId,
                    DoctorName = r.Doctor?.User?.FullName ?? "Unknown",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.DateCreated?.ToString("dd-MM-yyyy"),
                    UpdatedAt = r.DateModified?.ToString("dd-MM-yyyy"),
                }).ToList()
            };
        }

        public async Task<bool> CanPatientReviewAsync(int appointmentId, int patientId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            var patient = await _patientRepository.GetByUserIdAsync(patientId);
            if (appointment == null)
            {
                return false;
            }
            var existingReview = await _reviewRepository.GetByAppointmentIdAsync(appointmentId);
            if (existingReview != null)
            {
                return false;
            }

            // Check if appointment belongs to the patient
            if (appointment.PatientId != patient.PatientId)
            {
                return false;
            }

            // Check if appointment is completed
            if (appointment.Status != AppointmentStatus.Completed)
            {
                return false;
            }

            if (appointment.Date < DateTime.UtcNow)
            {
                return false;
            }

            return true;
        }

        private async Task UpdateDoctorRatingAsync(int doctorId)
        {
            var averageRating = await _reviewRepository.GetAverageRatingByDoctorIdAsync(doctorId);
            var doctor = await _doctorRepository.GetByIdAsync(doctorId);

            if (doctor != null)
            {
                doctor.Rating = averageRating;
                await _doctorRepository.UpdateAsync(doctor);
            }
        }
    }
}

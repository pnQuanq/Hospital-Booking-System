namespace Docmate.Core.Domain.Dtos
{
    public class PatientPreferenceDto
    {
        public int PatientId { get; set; }
        public Dictionary<int, double> SpecialtyPreferences { get; set; } = new();
        public Dictionary<int, int> DoctorVisitCounts { get; set; } = new();
        public Dictionary<int, double> DoctorRatingHistory { get; set; } = new();
        public double AverageRatingPreference { get; set; }
        public int TotalAppointments { get; set; }
    }
}

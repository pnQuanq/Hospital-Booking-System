using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Docmate.Core.Domain.Common;
using Docmate.Core.Domain.Entities;

namespace Docmate.Infrastructure.Persistence.DataContext
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Specialty> Specialties { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<SymptomLog> SymptomLogs { get; set; }
        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // ApplicationUser <-> Patient
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Patient)
                .WithOne(p => p.User)
                .HasForeignKey<Patient>(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ApplicationUser <-> Doctor
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Doctor)
                .WithOne(d => d.User)
                .HasForeignKey<Doctor>(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Doctor <-> Specialty
            builder.Entity<Doctor>()
                .HasOne(d => d.Specialty)
                .WithMany(s => s.Doctors)
                .HasForeignKey(d => d.SpecialtyId);

            // Doctor <-> Appointments
            builder.Entity<Doctor>()
                .HasMany(d => d.Appointments)
                .WithOne(a => a.Doctor)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Patient <-> Appointments
            builder.Entity<Patient>()
                .HasMany(p => p.Appointments)
                .WithOne(a => a.Patient)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment <-> Review (One-to-One)
            builder.Entity<Appointment>()
                .HasOne(a => a.Review)
                .WithOne(r => r.Appointment)
                .HasForeignKey<Review>(r => r.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Patient <-> Reviews
            builder.Entity<Review>()
                .HasOne(r => r.Patient)
                .WithMany() // no navigation on Patient side
                .HasForeignKey(r => r.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Doctor <-> Reviews
            builder.Entity<Review>()
                .HasOne(r => r.Doctor)
                .WithMany() // no navigation on Doctor side
                .HasForeignKey(r => r.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Patient <-> SymptomLogs
            builder.Entity<Patient>()
                .HasMany(p => p.SymptomLogs)
                .WithOne(s => s.Patient)
                .HasForeignKey(s => s.PatientId);

            // Doctor <-> TimeSlots
            builder.Entity<Doctor>()
                .HasMany(d => d.TimeSlots)
                .WithOne(ts => ts.Doctor)
                .HasForeignKey(ts => ts.DoctorId);

            // Configure enum to be stored as string
            builder.Entity<Appointment>()
                .Property(a => a.Status)
                .HasConversion<string>();

            builder.Entity<TimeSlot>()
                .Property(ts => ts.Status)
                .HasConversion<string>();


            // Optional: enforce required relationships, lengths, etc.
            builder.Entity<Specialty>()
                .HasKey(s => s.SpecialtyId);

            builder.Entity<Specialty>()
                .Property(s => s.SpecialtyId)
                .HasMaxLength(50);

            builder.Entity<ChatConversation>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId);
        }
        public override int SaveChanges()
        {
            HandleTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            HandleTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void HandleTimestamps()
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity &&
                           (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (BaseEntity)entityEntry.Entity;

                if (entityEntry.State == EntityState.Added)
                {
                    entity.DateCreated = DateTime.Now;
                }

                entity.DateModified = DateTime.Now;
            }
        }
    }
}

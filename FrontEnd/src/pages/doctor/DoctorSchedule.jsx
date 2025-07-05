import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState({
    morningStart: "07:00",
    morningEnd: "09:00",
    afternoonStart: "13:30",
    afternoonEnd: "15:00",
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    // Initialize with current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    setCurrentWeekStart(startOfWeek);
    setSelectedDate(today);

    // Fetch appointments from API
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("AToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/doctor/get-booked-appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const appointmentData = await response.json();

      // Transform the API data to match the UI format
      const transformedAppointments = appointmentData.map((appointment) => {
        return {
          id: appointment.appointmentId,
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone || "N/A",
          patientEmail: appointment.patientEmail || "N/A",
          patientGender: appointment.patientGender,
          patientDateOfBirth: appointment.patientDateOfBirth,
          patientHeight: appointment.patientHeight,
          patientWeight: appointment.patientWeight,
          patientImageUrl: appointment.patientImageUrl,
          // Extract date in YYYY-MM-DD format
          date: appointment.dateString,
          // Extract time in HH:MM format
          time: appointment.timeString,
          status: appointment.status,
          type: "Consultation",
          doctorName: appointment.doctorName,
          specialty: appointment.specialty,
          // Store original datetime for reference
          originalDateTime: appointment.date,
        };
      });

      console.log("Transformed appointments:", transformedAppointments);

      setAppointments(transformedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fixed date formatting function
  const formatDateForUI = (dateString) => {
    try {
      // Handle ISO date string properly
      let date;
      if (dateString.includes("T")) {
        // ISO format: "2025-07-03T07:30:00"
        date = new Date(dateString);
      } else {
        // Other formats
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Invalid date";
      }

      // Return date in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;

      console.log("Formatted date:", dateString, "->", formatted);
      return formatted;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid date";
    }
  };

  // Fixed time formatting function
  const formatTimeForUI = (dateString) => {
    try {
      // Handle ISO date string properly
      let date;
      if (dateString.includes("T")) {
        // ISO format: "2025-07-03T07:30:00"
        date = new Date(dateString);
      } else {
        // Other formats
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.error("Invalid date for time:", dateString);
        return "Invalid time";
      }

      // Return time in HH:MM format (24-hour)
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const formatted = `${hours}:${minutes}`;

      console.log("Formatted time:", dateString, "->", formatted);
      return formatted;
    } catch (error) {
      console.error("Error formatting time:", dateString, error);
      return "Invalid time";
    }
  };

  function generateTimeSlots() {
    const slots = [];

    // Morning slots (7:00 AM - 9:00 AM)
    for (let hour = 7; hour < 9; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }

    // Afternoon slots (1:30 PM - 3:00 PM)
    for (let hour = 13; hour < 15; hour++) {
      for (let minute = 30; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }

    // Add 3:00 PM slot
    slots.push("15:00");

    return slots;
  }

  function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Fixed appointment matching function
  function getAppointmentForSlot(date, time) {
    const localDateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format

    const match = appointments.find((apt) => {
      const dateMatch = apt.date === localDateString;
      const timeMatch = apt.time === time;

      console.log("Checking appointment:", {
        appointmentDate: apt.date,
        appointmentTime: apt.time,
        slotDate: localDateString,
        slotTime: time,
        dateMatch,
        timeMatch,
        patientName: apt.patientName,
      });

      return dateMatch && timeMatch;
    });

    if (match) {
      console.log(
        "✅ Found matching appointment:",
        match.patientName,
        "at",
        localDateString,
        time
      );
    } else {
      console.log("❌ No appointment found for", localDateString, time);
    }

    return match;
  }

  function getStatusColor(status) {
    switch (status) {
      case "Scheduled":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function isWorkingHour(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Morning: 7:00-9:00 (420-540 minutes)
    const morningStart = 7 * 60;
    const morningEnd = 9 * 60;

    // Afternoon: 13:30-15:00 (810-900 minutes)
    const afternoonStart = 13 * 60 + 30;
    const afternoonEnd = 15 * 60;

    return (
      (timeInMinutes >= morningStart && timeInMinutes <= morningEnd) ||
      (timeInMinutes >= afternoonStart && timeInMinutes <= afternoonEnd)
    );
  }

  function navigateWeek(direction) {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  }

  function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Refresh appointments
  const handleRefresh = () => {
    fetchAppointments();
  };

  const weekDates = getWeekDates(currentWeekStart);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Doctor Schedule
            </h1>
            <p className="text-gray-600">
              Track your appointments and availability
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentWeekStart.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            {/* Calendar Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                  // Calculate the start of the week for the selected date
                  const startOfWeek = new Date(newDate);
                  startOfWeek.setDate(newDate.getDate() - newDate.getDay());
                  setCurrentWeekStart(startOfWeek);
                }}
                className="absolute opacity-0 w-10 h-10 cursor-pointer"
              />
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Pick Date</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header with days */}
            <thead className="bg-gray-50">
              <tr>
                <th className="w-24 p-4 text-left font-semibold text-gray-700 border-r">
                  Time
                </th>
                {weekDates.map((date, index) => (
                  <th
                    key={index}
                    className="p-4 text-center font-semibold text-gray-700 border-r min-w-32"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-500">
                        {daysOfWeek[date.getDay()]}
                      </span>
                      <span
                        className={`text-lg ${
                          isToday(date)
                            ? "text-blue-600 font-bold"
                            : "text-gray-900"
                        } ${isPastDate(date) ? "text-gray-400" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time slots */}
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr key={timeIndex} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r bg-gray-50">
                    <div className="text-sm font-medium text-gray-700">
                      {formatTime(time)}
                    </div>
                  </td>
                  {weekDates.map((date, dateIndex) => {
                    const appointment = getAppointmentForSlot(date, time);
                    const isWorking = isWorkingHour(time);
                    const isPast = isPastDate(date);
                    const isWeekend =
                      date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <td
                        key={dateIndex}
                        className={`p-2 border-r min-h-16 ${
                          isPast ? "bg-gray-50" : ""
                        } ${isWeekend ? "bg-gray-100" : ""}`}
                      >
                        {appointment ? (
                          // Show appointment regardless of whether it's in the past or not
                          <div
                            className={`p-2 rounded-lg border text-xs ${getStatusColor(
                              appointment.status
                            )} ${isPast ? "opacity-75" : ""}`}
                          >
                            <div className="font-semibold mb-1">
                              {appointment.patientName}
                            </div>

                            {appointment.patientGender && (
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs">
                                  Gender: {appointment.patientGender}
                                </span>
                              </div>
                            )}
                            <div className="mt-1 text-center">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-70">
                                {appointment.status}
                              </span>
                            </div>
                            {/* Add a "Past" indicator for completed past appointments */}
                            {isPast && (
                              <div className="mt-1 text-center">
                                <span className="px-1 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                                  Past
                                </span>
                              </div>
                            )}
                          </div>
                        ) : isWorking && !isWeekend && !isPast ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-full h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 cursor-pointer transition-colors">
                              <Plus className="h-4 w-4" />
                            </div>
                          </div>
                        ) : isWorking && !isWeekend && isPast ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-300 text-xs">Past</div>
                          </div>
                        ) : isWeekend ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-400 text-xs">Weekend</div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-300 text-xs">
                              Off Hours
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-dashed border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  appointments.filter(
                    (apt) => apt.date === new Date().toISOString().split("T")[0]
                  ).length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  appointments.filter((apt) => {
                    const status = apt.status;
                    return status === "Completed";
                  }).length
                }
              </p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;

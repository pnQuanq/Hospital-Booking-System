import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { jwtDecode } from "jwt-decode";

const Appointment = () => {
  const { docId } = useParams();
  const { currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeSlotStartIndex, setTimeSlotStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const SLOTS_PER_VIEW = 7;

  // TimeSlot Status enum (should match backend)
  const TimeSlotStatus = {
    Free: 0,
    Reserved: 1,
    Confirmed: 2,
    Blocked: 3,
  };

  // Appointment Status enum
  const AppointmentStatus = {
    Pending: "Pending",
    Scheduled: "Scheduled",
    Completed: "Completed",
    Cancelled: "Cancelled",
  };

  const fetchDocInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("AToken");
      const response = await fetch(
        `http://localhost:5000/api/home/get-doctor-details/${docId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDocInfo(data);
    } catch (error) {
      console.error("Failed to fetch doctor info:", error);
      setError("Failed to load doctor information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservedAndConfirmedSlots = async () => {
    try {
      const token = localStorage.getItem("AToken");

      // Fetch both reserved and confirmed slots
      const [reservedResponse, confirmedResponse] = await Promise.all([
        fetch(
          `http://localhost:5000/api/home/get-doctor-reserved-slots/${docId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        fetch(
          `http://localhost:5000/api/home/get-doctor-confirmed-slots/${docId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      if (!reservedResponse.ok || !confirmedResponse.ok) {
        throw new Error(
          `HTTP error! Reserved: ${reservedResponse.status}, Confirmed: ${confirmedResponse.status}`
        );
      }

      const [reservedSlots, confirmedSlots] = await Promise.all([
        reservedResponse.json(),
        confirmedResponse.json(),
      ]);

      // Combine both types of slots
      const allUnavailableSlots = [...reservedSlots, ...confirmedSlots];
      generateSlotsWithStatus(allUnavailableSlots);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setError("Failed to load slot availability. Please try again.");
    }
  };

  const generateSlotsWithStatus = (unavailableSlots) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const newDocSlots = [];
    let dayOffset = 1;
    let weekdaysAdded = 0;

    // Create a map of unavailable slots for quick lookup
    const unavailableSlotsMap = new Map();
    unavailableSlots.forEach((slot) => {
      const slotDateTime = new Date(slot.time);
      const key = `${slotDateTime.getFullYear()}-${slotDateTime.getMonth()}-${slotDateTime.getDate()}-${slotDateTime.getHours()}-${slotDateTime.getMinutes()}`;
      unavailableSlotsMap.set(key, slot);
    });

    // Get next 7 weekdays (Mon-Fri) - only future days
    while (weekdaysAdded < 7) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday) and only include future dates
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && currentDate > today) {
        const timeSlots = [];

        // Morning slots (7:00 AM - 9:00 AM)
        let morningStart = new Date(currentDate);
        morningStart.setHours(7, 0, 0, 0);
        let morningEnd = new Date(currentDate);
        morningEnd.setHours(9, 0, 0, 0);

        // Afternoon slots (1:30 PM - 3:00 PM)
        let afternoonStart = new Date(currentDate);
        afternoonStart.setHours(13, 30, 0, 0);
        let afternoonEnd = new Date(currentDate);
        afternoonEnd.setHours(15, 0, 0, 0);

        // Generate morning slots
        let currentTime = new Date(morningStart);
        while (currentTime <= morningEnd) {
          const now = new Date();
          // Only add slots that are in the future
          if (currentTime > now) {
            timeSlots.push(
              createTimeSlotWithStatus(currentTime, unavailableSlotsMap)
            );
          }
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        // Generate afternoon slots
        currentTime = new Date(afternoonStart);
        while (currentTime <= afternoonEnd) {
          const now = new Date();
          // Only add slots that are in the future
          if (currentTime > now) {
            timeSlots.push(
              createTimeSlotWithStatus(currentTime, unavailableSlotsMap)
            );
          }
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        // Only add the day if it has available time slots
        if (timeSlots.length > 0) {
          newDocSlots.push(timeSlots);
          weekdaysAdded++;
        }
      }
      dayOffset++;
    }

    setDocSlots(newDocSlots);
  };

  const createTimeSlotWithStatus = (date, unavailableSlotsMap) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
    const unavailableSlot = unavailableSlotsMap.get(key);

    return {
      datetime: new Date(date),
      time: date
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/AM|PM/, (match) => match.toLowerCase()),
      status: unavailableSlot ? unavailableSlot.status : TimeSlotStatus.Free,
      timeSlotId: unavailableSlot ? unavailableSlot.timeSlotId : null,
      isUnavailable: !!unavailableSlot,
    };
  };

  const getSlotStatusClass = (slot) => {
    if (slot.isUnavailable) {
      switch (slot.status) {
        case TimeSlotStatus.Reserved:
          return "text-orange-600 border border-orange-300 bg-orange-50 cursor-not-allowed";
        case TimeSlotStatus.Confirmed:
          return "text-red-600 border border-red-300 bg-red-50 cursor-not-allowed";
        case TimeSlotStatus.Blocked:
          return "text-gray-400 border border-gray-200 bg-gray-100 cursor-not-allowed";
        default:
          return "text-gray-400 border border-gray-200 bg-gray-100 cursor-not-allowed";
      }
    }
    // Free slot - clickable
    return "text-gray-600 border border-gray-300 hover:bg-gray-50 cursor-pointer";
  };

  const getSlotStatusText = (slot) => {
    if (slot.isUnavailable) {
      switch (slot.status) {
        case TimeSlotStatus.Reserved:
          return " (Reserved)";
        case TimeSlotStatus.Confirmed:
          return " (Booked)";
        case TimeSlotStatus.Blocked:
          return " (Blocked)";
        default:
          return " (Unavailable)";
      }
    }
    return "";
  };

  const handleSlotClick = (slot) => {
    // Only allow selection of Free slots
    if (slot.isUnavailable || slot.status !== TimeSlotStatus.Free) {
      return;
    }

    // Toggle selection - if same slot clicked, deselect it
    if (
      selectedTimeSlot &&
      selectedTimeSlot.datetime.getTime() === slot.datetime.getTime()
    ) {
      setSelectedTimeSlot(null);
    } else {
      setSelectedTimeSlot(slot);
    }
  };

  const handlePrevTimeSlots = () => {
    setTimeSlotStartIndex((prev) => Math.max(0, prev - SLOTS_PER_VIEW));
  };

  const handleNextTimeSlots = () => {
    const currentSlots = docSlots[slotIndex] || [];
    const maxStartIndex = Math.max(0, currentSlots.length - SLOTS_PER_VIEW);
    setTimeSlotStartIndex((prev) =>
      Math.min(maxStartIndex, prev + SLOTS_PER_VIEW)
    );
  };

  const bookAppointment = async () => {
    if (!selectedTimeSlot) {
      alert("Please select an available time slot");
      return;
    }

    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = parseInt(decodedToken?.UserId);

      const appointmentData = {
        doctorId: parseInt(docId),
        date: selectedTimeSlot.datetime.toISOString().split("T")[0], // Send date as YYYY-MM-DD
        time: selectedTimeSlot.time,
      };

      const response = await fetch(
        "http://localhost:5000/api/home/add-appointment",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to book appointment: ${response.status}`
        );
      }

      alert(`Appointment booked successfully for ${selectedTimeSlot.time}`);

      // Refresh slots to get updated status
      await fetchAllReservedAndConfirmedSlots();

      // Reset selections
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert(`Failed to book appointment: ${error.message}`);
    }
  };

  useEffect(() => {
    if (docId) {
      fetchDocInfo();
    }
  }, [docId]);

  useEffect(() => {
    if (docInfo) {
      fetchAllReservedAndConfirmedSlots();
    }
  }, [docInfo]);

  // Helper function to get visible slots
  const getVisibleSlots = () => {
    const currentSlots = docSlots[slotIndex] || [];
    return currentSlots.slice(
      timeSlotStartIndex,
      timeSlotStartIndex + SLOTS_PER_VIEW
    );
  };

  // Check if navigation buttons should be enabled
  const canGoPrev = timeSlotStartIndex > 0;
  const canGoNext = () => {
    const currentSlots = docSlots[slotIndex] || [];
    return timeSlotStartIndex + SLOTS_PER_VIEW < currentSlots.length;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading doctor information...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // No doctor found
  if (!docInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Doctor not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-blue-600 w-full sm:max-w-72 rounded-lg"
            src={`http://localhost:5000${docInfo.imageUrl}`}
            alt={docInfo.fullName}
            onError={(e) => {
              e.target.src = "/placeholder-doctor.jpg"; // fallback image
            }}
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.fullName}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{docInfo.specialtyDescription}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experienceYears} years experience
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600">
              {docInfo.rating?.toFixed(1) || "N/A"}
            </span>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.description || "No description available."}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {docInfo.email}
            </p>
            <p className="text-sm mt-1">
              <strong>Availability:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  docInfo.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {docInfo.isAvailable ? "Available" : "Not Available"}
              </span>
            </p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-600">{currencySymbol}{docInfo.fee}</span>
          </p>
        </div>
      </div>

      {/* Only show booking slots if doctor is available and has time slots */}
      {docInfo.isAvailable && docSlots.length > 0 && (
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.map((daySlots, index) => (
              <div
                key={index}
                onClick={() => {
                  setSlotIndex(index);
                  setSelectedTimeSlot(null);
                  setTimeSlotStartIndex(0); // Reset time slot view when changing day
                }}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200"
                }`}
              >
                <p>
                  {daySlots[0] && daysOfWeek[daySlots[0].datetime.getDay()]}
                </p>
                <p>{daySlots[0] && daySlots[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4">
            {/* Previous button */}
            <button
              onClick={handlePrevTimeSlots}
              disabled={!canGoPrev}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                canGoPrev
                  ? "border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              ←
            </button>

            {/* Time slots */}
            <div className="flex items-center gap-3 flex-1 justify-center">
              {getVisibleSlots().map((slot, index) => (
                <div
                  key={`${
                    timeSlotStartIndex + index
                  }-${slot.datetime.getTime()}`}
                  onClick={() => handleSlotClick(slot)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full select-none transition-colors ${
                    selectedTimeSlot &&
                    selectedTimeSlot.datetime.getTime() ===
                      slot.datetime.getTime()
                      ? "bg-blue-600 text-white"
                      : getSlotStatusClass(slot)
                  }`}
                  style={{ userSelect: "none" }}
                  title={
                    slot.isUnavailable
                      ? `This slot is ${getSlotStatusText(slot)
                          .toLowerCase()
                          .replace(/[()]/g, "")}`
                      : "Click to select this time slot"
                  }
                >
                  {slot.time}
                  {getSlotStatusText(slot)}
                </div>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNextTimeSlots}
              disabled={!canGoNext()}
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${
                canGoNext()
                  ? "border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              →
            </button>
          </div>

          {/* Legend for slot status colors */}
          <div className="mt-4 text-xs text-gray-500">
            <p className="mb-2">Slot Status:</p>
            <div className="flex gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-300 rounded"></div>
                Available
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-orange-300 bg-orange-50 rounded"></div>
                Reserved
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-red-300 bg-red-50 rounded"></div>
                Booked
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-200 bg-gray-100 rounded"></div>
                Blocked
              </span>
            </div>
          </div>

          {selectedTimeSlot && (
            <div className="my-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected slot: {selectedTimeSlot.time}
              </p>
              <button
                onClick={bookAppointment}
                className="bg-blue-600 text-white text-sm font-light px-14 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                Book appointment
              </button>
            </div>
          )}
        </div>
      )}

      {docInfo.isAvailable && docSlots.length === 0 && (
        <div className="sm:ml-72 sm:pl-4 mt-4 text-center py-8">
          <p className="text-gray-500 font-medium">
            No available time slots for this doctor.
          </p>
        </div>
      )}

      {!docInfo.isAvailable && (
        <div className="sm:ml-72 sm:pl-4 mt-4 text-center py-8">
          <p className="text-red-500 font-medium">
            This doctor is currently not available for appointments.
          </p>
        </div>
      )}
    </div>
  );
};

export default Appointment;

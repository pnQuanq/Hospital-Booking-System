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
  const [slotTime, setSlotTime] = useState("");
  const [timeSlotStartIndex, setTimeSlotStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const SLOTS_PER_VIEW = 7;

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

  const getAvailableSlots = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const newDocSlots = [];
    let dayOffset = 1;
    let weekdaysAdded = 0;

    // Get next 7 weekdays (Mon-Fri)
    while (weekdaysAdded < 7) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
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
          timeSlots.push(createTimeSlot(currentTime));
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        // Generate afternoon slots
        currentTime = new Date(afternoonStart);
        while (currentTime <= afternoonEnd) {
          timeSlots.push(createTimeSlot(currentTime));
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        newDocSlots.push(timeSlots);
        weekdaysAdded++;
      }
      dayOffset++;
    }

    setDocSlots(newDocSlots);
  };

  const createTimeSlot = (date) => {
    return {
      datetime: new Date(date),
      time: date
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/AM|PM/, (match) => match.toLowerCase()),
    };
  };

  const handleSlotClick = (clickedSlotTime) => {
    // Toggle selection - if same slot clicked, deselect it
    if (slotTime === clickedSlotTime) {
      setSlotTime("");
    } else {
      setSlotTime(clickedSlotTime);
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
    if (!slotTime || !docSlots[slotIndex]) {
      alert("Please select a time slot");
      return;
    }

    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    try {
      const selectedSlot = docSlots[slotIndex].find(
        (slot) => slot.time === slotTime
      );
      if (!selectedSlot) {
        alert("Invalid time slot selected");
        return;
      }

      const decodedToken = jwtDecode(token);
      const patientId = parseInt(decodedToken?.UserId);

      const appointmentData = {
        doctorId: parseInt(docId),
        date: selectedSlot.datetime,
        time: slotTime,
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
        throw new Error(`Failed to book appointment: ${response.status}`);
      }
      // Here you can implement the booking API call
      console.log("Booking appointment:", {
        doctorId: docId,
        dateTime: selectedSlot.datetime,
        time: slotTime,
      });

      alert(`Appointment booked successfully for ${slotTime}`);

      // Reset selections
      setSlotTime("");
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  useEffect(() => {
    if (docId) {
      fetchDocInfo();
    }
  }, [docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
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
            <span className="text-gray-600">{currencySymbol}150</span>
          </p>
        </div>
      </div>

      {/* Only show booking slots if doctor is available */}
      {docInfo.isAvailable && (
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime("");
                  setTimeSlotStartIndex(0); // Reset time slot view when changing day
                }}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200"
                }`}
              >
                <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
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
              {getVisibleSlots().map((item, index) => (
                <p
                  key={timeSlotStartIndex + index}
                  onClick={() => handleSlotClick(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer select-none transition-colors ${
                    item.time === slotTime
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 border border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{ userSelect: "none" }}
                >
                  {item.time}
                </p>
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

          {slotTime && (
            <div className="my-4">
              <p className="text-sm text-gray-600 mb-2">
                Selected slot: {slotTime}
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

      {!docInfo.isAvailable && (
        <div className="sm:ml-72 sm:pl-4 mt-4 text-center py-8">
          <p className="text-red-500 font-medium">
            This doctor is currently not available for appointments.
          </p>
        </div>
      )}

      <RelatedDoctors docId={docId} speciality={docInfo.specialtyDescription} />
    </div>
  );
};

export default Appointment;

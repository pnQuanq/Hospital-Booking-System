import React, { useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("AToken");
      console.log("1. Token:", token);
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = parseInt(decoded?.UserId);
      console.log("2. Patient ID:", userId);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/patient/get-all-appointment?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("3. API Response:", res.data);
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    // Confirm cancellation
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.put(
        "http://localhost:5000/api/home/update-appointment",
        {
          appointmentId: appointmentId,
          newStatus: "Cancelled"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Cancel appointment response:", response.data);
      
      // Update the local state to reflect the change
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.appointmentId === appointmentId
            ? { ...appointment, status: "Cancelled" }
            : appointment
        )
      );

      alert("Appointment cancelled successfully!");
      
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      
      // Handle different error scenarios
      if (err.response?.status === 400) {
        alert("Invalid appointment ID or status. Please try again.");
      } else if (err.response?.status === 401) {
        alert("You are not authorized to perform this action.");
      } else {
        alert("Failed to cancel appointment. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-300"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={`http://localhost:5000${item.doctorImageUrl}`}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.doctorName}
                </p>
                <p>{item.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Status:</p>
                <p className={`text-xs font-medium ${
                  item.status === "Cancelled" ? "text-red-600" : 
                  item.status === "Confirmed" ? "text-green-600" : 
                  "text-yellow-600"
                }`}>
                  {item.status}
                </p>
                <p className="text-zinc-700 font-medium mt-1">Date & Time:</p>
                <p className="text-xs">
                  {new Date(item.date).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                {/* Only show buttons if status is not "Cancelled" */}
                {item.status !== "Cancelled" && (
                  <>
                    <button 
                      className="cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300"
                      disabled={loading}
                    >
                      Pay Online
                    </button>
                    <button 
                      className={`cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => handleCancelAppointment(item.appointmentId)}
                      disabled={loading}
                    >
                      {loading ? "Cancelling..." : "Cancel appointment"}
                    </button>
                  </>
                )}
                {/* Show message for cancelled appointments */}
                {item.status === "Cancelled" && (
                  <p className="text-red-600 text-sm font-medium text-center sm:min-w-48 py-2">
                    Appointment Cancelled
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointment;
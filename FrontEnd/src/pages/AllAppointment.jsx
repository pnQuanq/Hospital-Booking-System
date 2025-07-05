import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const AllAppointments = () => {
  const token = localStorage.getItem("AToken");
  const { calculateAge } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all appointments
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/admin/all-appointments`,
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

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again.");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/update-appointment-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointmentId: appointmentId,
            newStatus: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast.success(
        result.message || "Appointment status updated successfully"
      );

      // Refresh the appointments list
      fetchAllAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  // Handle status change
  const handleStatusChange = (appointmentId, newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to change the status to ${newStatus}?`
      )
    ) {
      updateAppointmentStatus(appointmentId, newStatus);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllAppointments();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl m-5">
        <p className="mb-3 text-lg font-medium">All Appointments</p>
        <div className="bg-white border border-gray-200 rounded text-sm min-h-[60vh] max-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl m-5">
        <p className="mb-3 text-lg font-medium">All Appointments</p>
        <div className="bg-white border border-gray-200 rounded text-sm min-h-[60vh] max-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAllAppointments}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-3">
        <p className="text-lg font-medium">All Appointments</p>
        <button
          onClick={fetchAllAppointments}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded text-sm min-h-[60vh] max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b border-gray-200 bg-gray-50 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Status</p>
          <p>Actions</p>
        </div>

        {appointments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          appointments.map((item, index) => (
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
              key={item.appointmentId}
            >
              <p className="max-sm:hidden">{index + 1}</p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={
                    item.patientImageUrl
                      ? `http://localhost:5000${item.patientImageUrl}`
                      : assets.default_profile_pic
                  }
                  alt={item.patientFullName}
                  onError={(e) => {
                    e.target.onerror = null; // Ngăn loop fallback
                    e.target.src = assets.default_profile_pic;
                  }}
                />

                <div>
                  <p className="font-medium text-gray-700">
                    {item.patientFullName}
                  </p>
                  <p className="text-xs text-gray-500">{item.patientEmail}</p>
                </div>
              </div>

              <p className="max-sm:hidden">{calculateAge(item.patientDob)}</p>

              <div>
                <p className="font-medium">{item.slotDate}</p>
                <p className="text-xs text-gray-500">{item.slotTime}</p>
              </div>

              <div className="flex items-center gap-2">
                <img
                  className="w-6 h-6 rounded-full object-cover"
                  src={`http://localhost:5000${item.doctorImageUrl}`}
                  alt={item.doctorName}
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div>
                  <p className="font-medium text-gray-700">{item.doctorName}</p>
                  <p className="text-xs text-gray-500">{item.specialty}</p>
                </div>
              </div>

              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {item.status === "Pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusChange(item.appointmentId, "Scheduled")
                      }
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(item.appointmentId, "Cancelled")
                      }
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {item.status === "Scheduled" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusChange(item.appointmentId, "Completed")
                      }
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(item.appointmentId, "Cancelled")
                      }
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {(item.status === "Completed" ||
                  item.status === "Cancelled") && (
                  <span className="text-xs text-gray-400">No actions</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllAppointments;

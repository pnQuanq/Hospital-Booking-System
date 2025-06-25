import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
} from "lucide-react";

const DoctorAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(
        (appointment) =>
          appointment.doctorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.specialty
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Get the JWT token from localStorage
      const token = localStorage.getItem("AToken");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/doctor/get-all-appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          console.log("Error response body:", errorData);
          errorMessage += ` - ${errorData}`;
        } catch (e) {
          console.log("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewAppointment = (appointmentId) => {
    console.log("View appointment:", appointmentId);
    // Implement view logic
  };

  const handleConfirmAppointment = (appointmentId) => {
    console.log("Confirm appointment:", appointmentId);
    // Implement confirm logic
  };

  const handleCancelAppointment = (appointmentId) => {
    console.log("Cancel appointment:", appointmentId);
    // Implement cancel logic
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Appointments</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading appointments...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Appointments</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium">Error loading appointments</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchAppointments}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-500">
                      No appointments found
                    </p>
                    <p className="text-sm mt-2 text-gray-400">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No appointments scheduled yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.appointmentId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {appointment.doctorImageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full mr-3"
                            src={appointment.doctorImageUrl}
                            alt={appointment.doctorName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.doctorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {appointment.doctorId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {formatTime(appointment.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleViewAppointment(appointment.appointmentId)
                          }
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmAppointment(appointment.appointmentId)
                          }
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Confirm"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment.appointmentId)
                          }
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Showing {filteredAppointments.length} of {appointments.length}{" "}
        appointments
      </div>
    </div>
  );
};

export default DoctorAppointment;

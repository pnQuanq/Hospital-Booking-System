import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  Weight,
  Ruler,
  AlertTriangle,
} from "lucide-react";

const DoctorAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
  const token = localStorage.getItem("AToken");

  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      // Get the JWT token from localStorage

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
    const appointment = appointments.find(
      (apt) => apt.appointmentId === appointmentId
    );
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowModal(true);
    }
  };

  const handleConfirmAppointment = (appointmentId) => {
    console.log("Confirm appointment:", appointmentId);
    // Implement confirm logic
  };

  const handleCancelAppointment = (appointmentId) => {
    console.log("Cancel appointment:", appointmentId);
    // Implement cancel logic
  };

  // Modal component for appointment details
  const AppointmentDetailModal = () => {
    if (!showModal || !selectedAppointment) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              Appointment Details
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  {selectedAppointment.patientImageUrl ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={`http://localhost:5000${selectedAppointment.patientImageUrl}`}
                      alt={selectedAppointment.patientName}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.patientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {selectedAppointment.patientId}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600 w-20">
                      Gender:
                    </span>
                    <span className="text-gray-900">
                      {selectedAppointment.patientGender}
                    </span>
                  </div>
                  {selectedAppointment.patientAge && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600 w-20">
                        Age:
                      </span>
                      <span className="text-gray-900">
                        {selectedAppointment.patientAge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Physical Information */}
            {(selectedAppointment.patientWeight ||
              selectedAppointment.patientHeight) && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-indigo-600" />
                  Physical Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAppointment.patientWeight && (
                    <div className="flex items-center text-sm">
                      <Weight className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-600">Weight:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedAppointment.patientWeight} kg
                      </span>
                    </div>
                  )}
                  {selectedAppointment.patientHeight && (
                    <div className="flex items-center text-sm">
                      <Ruler className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-600">Height:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedAppointment.patientHeight} cm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Allergies */}
            {selectedAppointment.patientAllergy && (
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Allergies
                </h4>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    {selectedAppointment.patientAllergy}
                  </p>
                </div>
              </div>
            )}

            {/* Appointment Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Appointment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-600">Date:</span>
                    <span className="ml-2 text-gray-900">
                      {formatDate(selectedAppointment.date)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-600">Time:</span>
                    <span className="ml-2 text-gray-900">
                      {formatTime(selectedAppointment.date)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                  {selectedAppointment.appointmentType && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedAppointment.appointmentType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>           
          </div>
        </div>
      </div>
    );
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
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
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
                        {appointment.patientImageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full mr-3"
                            src={`http://localhost:5000${appointment.patientImageUrl}`}
                            alt={appointment.patientName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {appointment.patientId}
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
                      {appointment.patientGender}
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
                          onClick={() => {
                            handleConfirmAppointment(appointment.appointmentId);
                            handleStatusChange(
                              appointment.appointmentId,
                              "Completed"
                            );
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            handleConfirmAppointment(appointment.appointmentId);
                            handleStatusChange(
                              appointment.appointmentId,
                              "Cancelled"
                            );
                          }}
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

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal />
    </div>
  );
};

export default DoctorAppointment;

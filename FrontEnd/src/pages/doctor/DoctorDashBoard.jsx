import React, { useState, useEffect } from "react";
import Sidebar from "../../components/DoctorSideBar.jsx";
import OverviewPage from "./DoctorOverview.jsx";
import AppointmentsPage from "./DoctorAppointment.jsx";
import { SchedulePage, ProfilePage } from "./PlaceHolderPages.jsx";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [doctorData, setDoctorData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);

  // Fetch doctor details from API
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("AToken");
        console.log("Token found:", token ? "Yes" : "No");
        console.log("Token value:", token);
        
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        console.log("Making API request to get doctor details...");

        const response = await fetch(
          "http://localhost:5000/api/doctor/get-details",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        // Log the raw response text first
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!response.ok) {
          if (response.status === 401) {
            console.log("401 Unauthorized - clearing tokens and redirecting");
            localStorage.removeItem("AToken");
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("isDoctor");
            window.location.href = "/login";
            return;
          }
          
          if (response.status === 404) {
            throw new Error("Doctor details endpoint not found. Please check your API.");
          }
          
          if (response.status === 500) {
            throw new Error("Server error. Please try again later.");
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
        }

        // Parse JSON from response text
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Invalid JSON response from server");
        }

        console.log("Parsed result:", result);
        
        // Handle different possible response structures
        if (result.success === true || result.success === "true") {
          const doctorInfo = result.data || result.doctor || result;
          console.log("Doctor info extracted:", doctorInfo);
          setDoctorData(doctorInfo);
        } else if (result.message) {
          throw new Error(result.message);
        } else if (result.fullName || result.name) {
          // Sometimes the API might return doctor data directly without a success wrapper
          console.log("Direct doctor data found:", result);
          setDoctorData(result);
        } else {
          console.error("Unexpected response structure:", result);
          throw new Error("Unexpected response format from server");
        }

      } catch (error) {
        console.error("Detailed error information:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        setError(error.message);
        
        // If it's a network error, show specific message
        if (error.message.includes("fetch")) {
          setError("Cannot connect to server. Please check if the backend is running on http://localhost:5000");
        }
        
        // If it's an authentication error, redirect to login
        if (error.message.includes("authentication") || 
            error.message.includes("token") || 
            error.message.includes("login")) {
          localStorage.removeItem("AToken");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("isDoctor");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000); // Give user time to read the error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, []);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        setAppointmentsError(null);

        const token = localStorage.getItem("AToken");
        
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        console.log("Making API request to get appointments...");

        const response = await fetch(
          "http://localhost:5000/api/doctor/get-all-appointments",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Appointments response status:", response.status);

        // Log the raw response text first
        const responseText = await response.text();
        console.log("Raw appointments response:", responseText);

        if (!response.ok) {
          if (response.status === 401) {
            console.log("401 Unauthorized - clearing tokens and redirecting");
            localStorage.removeItem("AToken");
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("isDoctor");
            window.location.href = "/login";
            return;
          }
          
          if (response.status === 404) {
            throw new Error("Appointments endpoint not found. Please check your API.");
          }
          
          if (response.status === 500) {
            throw new Error("Server error while fetching appointments. Please try again later.");
          }
          
          throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
        }

        // Parse JSON from response text
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error("Invalid JSON response from server");
        }

        console.log("Parsed appointments result:", result);
        
        // Handle different possible response structures
        if (result.success === true || result.success === "true") {
          const appointmentsData = result.data || result.appointments || [];
          console.log("Appointments data extracted:", appointmentsData);
          setAppointments(appointmentsData);
        } else if (Array.isArray(result)) {
          // Sometimes the API might return appointments array directly
          console.log("Direct appointments array found:", result);
          setAppointments(result);
        } else if (result.message) {
          throw new Error(result.message);
        } else {
          console.error("Unexpected appointments response structure:", result);
          // Set empty array if structure is unexpected but no error
          setAppointments([]);
        }

      } catch (error) {
        console.error("Detailed appointments error information:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        setAppointmentsError(error.message);
        
        // If it's a network error, show specific message
        if (error.message.includes("fetch")) {
          setAppointmentsError("Cannot connect to server. Please check if the backend is running on http://localhost:5000");
        }
        
        // If it's an authentication error, redirect to login
        if (error.message.includes("authentication") || 
            error.message.includes("token") || 
            error.message.includes("login")) {
          localStorage.removeItem("AToken");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("isDoctor");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000); // Give user time to read the error
        }
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Only fetch appointments after doctor details are loaded
    if (doctorData && !loading) {
      fetchAppointments();
    }
  }, [doctorData, loading]);

  // Retry function for error state
  const handleRetry = () => {
    setError(null);
    setAppointmentsError(null);
    setLoading(true);
    // Re-run the effect
    window.location.reload();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewPage
            doctorData={doctorData}
            appointments={appointments}
            appointmentsLoading={appointmentsLoading}
            appointmentsError={appointmentsError}
          />
        );
      case "appointments":
        return (
          <AppointmentsPage 
            appointments={appointments} 
            loading={appointmentsLoading}
            error={appointmentsError}
          />
        );
      case "schedule":
        return <SchedulePage />;
      case "profile":
        return <ProfilePage doctorData={doctorData} />;
      default:
        return (
          <OverviewPage
            doctorData={doctorData}
            appointments={appointments}
            appointmentsLoading={appointmentsLoading}
            appointmentsError={appointmentsError}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor details...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <p><strong>Troubleshooting steps:</strong></p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Check if your backend server is running on port 5000</li>
              <li>Verify the API endpoint exists: /api/doctor/get-details</li>
              <li>Check browser console for detailed error logs</li>
              <li>Try logging out and logging in again</li>
            </ul>
          </div>
          
          <div className="space-x-2">
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/login"}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 p-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {doctorData?.fullName || doctorData?.name || "Doctor"}
            </p>
            {appointmentsLoading && (
              <p className="text-sm text-blue-600 mt-1">Loading appointments...</p>
            )}
            {appointmentsError && (
              <p className="text-sm text-red-600 mt-1">
                Error loading appointments: {appointmentsError}
              </p>
            )}
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
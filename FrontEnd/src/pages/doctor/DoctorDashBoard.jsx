import React, { useState } from "react";
import Sidebar from "../../components/DoctorSideBar.jsx";
import OverviewPage from "./DoctorOverview.jsx";
import AppointmentsPage from "./DoctorAppointment.jsx";
import PatientsPage from "./DoctorPatient.jsx";
import {
  SchedulePage,
  NotificationsPage,
  ProfilePage,
} from "./PlaceHolderPages.jsx";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [doctorData] = useState({
    fullName: "Dr. Sarah Johnson",
    specialtyDescription: "Cardiologist",
    rating: 4.8,
    totalPatients: 245,
    todayAppointments: 8,
    pendingAppointments: 3,
  });

  // Sample data - replace with API calls
  const [appointments] = useState([
    {
      id: 1,
      patientName: "John Smith",
      time: "09:00 AM",
      date: "2025-06-23",
      type: "Consultation",
      status: "confirmed",
      duration: "30 min",
    },
    {
      id: 2,
      patientName: "Emma Wilson",
      time: "10:30 AM",
      date: "2025-06-23",
      type: "Follow-up",
      status: "pending",
      duration: "15 min",
    },
    {
      id: 3,
      patientName: "Michael Brown",
      time: "02:00 PM",
      date: "2025-06-23",
      type: "Check-up",
      status: "confirmed",
      duration: "45 min",
    },
  ]);

  const [recentPatients] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      lastVisit: "2025-06-20",
      condition: "Hypertension",
      status: "Stable",
    },
    {
      id: 2,
      name: "Bob Davis",
      lastVisit: "2025-06-19",
      condition: "Diabetes",
      status: "Monitoring",
    },
    {
      id: 3,
      name: "Carol White",
      lastVisit: "2025-06-18",
      condition: "Heart Disease",
      status: "Treatment",
    },
  ]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewPage
            doctorData={doctorData}
            appointments={appointments}
            recentPatients={recentPatients}
          />
        );
      case "appointments":
        return <AppointmentsPage appointments={appointments} />;
      case "patients":
        return <PatientsPage recentPatients={recentPatients} />;
      case "schedule":
        return <SchedulePage />;
      case "notifications":
        return <NotificationsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <OverviewPage
            doctorData={doctorData}
            appointments={appointments}
            recentPatients={recentPatients}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {doctorData.fullName}</p>
          </div>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

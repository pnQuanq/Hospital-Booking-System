import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Doctors from "./pages/Doctor";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointment from "./pages/MyAppointment";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashBoard from "./pages/DashBoard";
import AllAppointment from "./pages/AllAppointment";
import AddDoctor from "./pages/AddDoctor";
import DoctorList from "./pages/DoctorList";
import AdminLayout from "./layouts/AdminLayout.jsx";
import SpecialtyManagement from "./pages/SpecialtyManagement.jsx";
import HospitalChatbot from "./components/HospitalChatbot.jsx";

import DoctorLayout from "./layouts/DoctorLayout.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashBoard.jsx";
import DoctorAppointments from "./pages/doctor/DoctorAppointment.jsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.jsx";
import DoctorSchedule from "./pages/doctor/DoctorSchedule.jsx";

const App = () => {
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = [
    "/admin-dashboard",
    "/all-appointments",
    "/add-doctor",
    "/doctor-list",
    "/specialty-management",
  ].some((route) => location.pathname.startsWith(route));

  // Check if current route is a doctor route - include ALL doctor routes
  const isDoctorRoute = [
    "/doctor-dashboard",
    "/doctor-appointments",
    "/doctor-profile",
    "/doctor-schedule",
  ].some((route) => location.pathname.startsWith(route));

  // For admin routes, only render Routes within AdminLayout
  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin-dashboard" element={<DashBoard />} />
          <Route path="/all-appointments" element={<AllAppointment />} />
          <Route path="/add-doctor" element={<AddDoctor />} />
          <Route path="/doctor-list" element={<DoctorList />} />
          <Route
            path="/specialty-management"
            element={<SpecialtyManagement />}
          />
        </Routes>
      </AdminLayout>
    );
  }

  // For doctor routes, render with DoctorLayout
  if (isDoctorRoute) {
    return (
      <DoctorLayout>
        <Routes>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule />} />
        </Routes>
      </DoctorLayout>
    );
  }

  // For patient routes, render with Navbar and Footer
  return (
    <div className="mx-4 sm:mx-[10%]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-appointments" element={<MyAppointment />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
      </Routes>
      <HospitalChatbot />
      <Footer />
    </div>
  );
};

export default App;

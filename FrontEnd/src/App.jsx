import React from "react";
import { Route, Routes } from "react-router-dom";
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

const App = () => {
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
        <Route path="/admin-dashboard" element={<DashBoard />} />
        <Route path="/all-appointments" element={<AllAppointment />} />
        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/doctor-list" element={<DoctorList />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;

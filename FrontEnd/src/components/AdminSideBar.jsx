import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const AdminSideBar = () => {
  const aToken = localStorage.getItem("AToken");

  return (
    <div className="min-h-screen bg-white border-r">
      {aToken && (
        <ul className="text-[#515151] mt-5">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 p-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-blue-600" : ""
              }`
            }
            to={"/admin-dashboard"}
          >
            <img className="w-7" src={assets.home_icon} alt="" />
            <p>DashBoard</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 p-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-blue-600" : ""
              }`
            }
            to={"/all-appointments"}
          >
            <img className="w-7" src={assets.appointment_icon} alt="" />
            <p>Appointments</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 p-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-blue-600" : ""
              }`
            }
            to={"/add-doctor"}
          >
            <img className="w-7" src={assets.add_icon} alt="" />
            <p>Add Doctor</p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 p-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-blue-600" : ""
              }`
            }
            to={"/doctor-list"}
          >
            <img className="w-7" src={assets.people_icon} alt="" />
            <p>Doctor List</p>
          </NavLink>
        </ul>
      )}
    </div>
  );
};

export default AdminSideBar;

import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const aToken = localStorage.getItem("AToken");

  const logout = () => {
    if (aToken) {
      localStorage.removeItem("AToken");
    }
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white ">
      <div className="flex items-center gap-2 text-xs">
        <img
          className="w-36 sm:w-40 cursor-pointer "
          src={assets.logo}
          alt=""
        />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : "Doctor"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-blue-600 text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
}

export default AdminNavbar;

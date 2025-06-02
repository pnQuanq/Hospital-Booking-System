import React, { useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);

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
                <p className="text-xs">{item.status}</p>
                <p className="text-zinc-700 font-medium mt-1">Date & Time:</p>
                <p className="text-xs">
                  {new Date(item.date).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <button className="cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300">
                  Pay Online
                </button>
                <button className="cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300">
                  Cancel appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointment;

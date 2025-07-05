import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TopDoctors = () => {
  const navigate = useNavigate();
  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const token = localStorage.getItem("AToken");

        const response = await fetch(
          "http://localhost:5000/api/home/get-top-doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch top doctors");
        }

        const data = await response.json();
        setTopDoctors(data);
      } catch (error) {
        console.error("Error fetching top doctors:", error);
      }
    };

    fetchTopDoctors();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {topDoctors.map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item.doctorId}`);
              scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img
              className="bg-blue-50 h-55"
              src={`http://localhost:5000${item.imageUrl}`}
              alt="doctor"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-center text-green-500">
                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                <p>{item.isAvailable ? "Available" : "Unavailable"}</p>
              </div>
              <p>Dr.{item.fullName}</p>
              <p>{item.specialtyDescription}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 cursor-pointer"
      >
        More
      </button>
    </div>
  );
};

export default TopDoctors;

import React, { useState } from "react";
import { Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      id: 2,
      day: "Tuesday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      id: 3,
      day: "Wednesday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      id: 4,
      day: "Thursday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      id: 5,
      day: "Friday",
      startTime: "09:00",
      endTime: "17:00",
      isActive: true,
    },
    {
      id: 6,
      day: "Saturday",
      startTime: "09:00",
      endTime: "13:00",
      isActive: false,
    },
    {
      id: 7,
      day: "Sunday",
      startTime: "00:00",
      endTime: "00:00",
      isActive: false,
    },
  ]);

  const toggleSchedule = (id) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id
          ? { ...schedule, isActive: !schedule.isActive }
          : schedule
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Management
          </h1>
          <p className="text-gray-600">
            Manage your working hours and availability
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{schedule.day}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  schedule.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {schedule.isActive ? "Active" : "Inactive"}
              </span>

              <button
                onClick={() => toggleSchedule(schedule.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  schedule.isActive
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {schedule.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Weekly Overview
        </h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="p-2 border rounded">
              <div className="font-medium text-sm text-gray-900">
                {schedule.day.substring(0, 3)}
              </div>
              <div
                className={`text-xs mt-1 ${
                  schedule.isActive ? "text-green-600" : "text-gray-400"
                }`}
              >
                {schedule.isActive
                  ? `${schedule.startTime}-${schedule.endTime}`
                  : "Closed"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;

import React from "react";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

const DoctorSidebar = ({ activeTab, setActiveTab, doctorData }) => {
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "patients", label: "Patients", icon: FileText },
    { id: "schedule", label: "Schedule", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {doctorData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h2 className="font-medium text-gray-900">{doctorData.fullName}</h2>
            <p className="text-sm text-gray-600">
              {doctorData.specialtyDescription}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;

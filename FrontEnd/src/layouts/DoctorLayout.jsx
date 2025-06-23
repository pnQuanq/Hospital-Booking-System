import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, Users, FileText, Bell, Settings, LogOut } from 'lucide-react';

const DoctorLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [doctorData] = useState({
    fullName: "Dr. Sarah Johnson",
    specialtyDescription: "Cardiologist",
    rating: 4.8,
    totalPatients: 245,
    todayAppointments: 8,
    pendingAppointments: 3
  });

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Users, 
      path: '/doctor-dashboard' 
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: Calendar, 
      path: '/doctor-appointments' 
    },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: FileText, 
      path: '/doctor-patients' 
    },
    { 
      id: 'schedule', 
      label: 'Schedule', 
      icon: Clock, 
      path: '/doctor-schedule' 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      path: '/doctor-notifications' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: Settings, 
      path: '/doctor-profile' 
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {doctorData.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{doctorData.fullName}</h2>
              <p className="text-sm text-gray-600">{doctorData.specialtyDescription}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
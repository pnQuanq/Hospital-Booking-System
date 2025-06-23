import React, { useState } from "react";
import {
  Bell,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "New Appointment Request",
      message:
        "John Smith has requested an appointment for tomorrow at 2:00 PM",
      time: "2 minutes ago",
      isRead: false,
      icon: Calendar,
      color: "blue",
    },
    {
      id: 2,
      type: "patient",
      title: "Patient Update",
      message: "Mary Johnson has updated her medical history",
      time: "15 minutes ago",
      isRead: false,
      icon: User,
      color: "green",
    },
    {
      id: 3,
      type: "alert",
      title: "Urgent: Patient Follow-up",
      message: "Follow-up required for patient ID #12345 - Critical results",
      time: "1 hour ago",
      isRead: false,
      icon: AlertCircle,
      color: "red",
    },
    {
      id: 4,
      type: "system",
      title: "Schedule Reminder",
      message: "You have 5 appointments scheduled for today",
      time: "2 hours ago",
      isRead: true,
      icon: Clock,
      color: "yellow",
    },
    {
      id: 5,
      type: "appointment",
      title: "Appointment Confirmed",
      message: "David Wilson confirmed his appointment for Friday at 10:00 AM",
      time: "3 hours ago",
      isRead: true,
      icon: CheckCircle,
      color: "green",
    },
  ]);

  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getColorClasses = (color, isRead) => {
    const baseClasses = {
      blue: isRead ? "bg-blue-50 text-blue-600" : "bg-blue-100 text-blue-700",
      green: isRead
        ? "bg-green-50 text-green-600"
        : "bg-green-100 text-green-700",
      red: isRead ? "bg-red-50 text-red-600" : "bg-red-100 text-red-700",
      yellow: isRead
        ? "bg-yellow-50 text-yellow-600"
        : "bg-yellow-100 text-yellow-700",
    };
    return baseClasses[color] || baseClasses.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            Stay updated with your latest activities
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "appointment", label: "Appointments" },
          { key: "patient", label: "Patients" },
          { key: "alert", label: "Alerts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all ${
                  !notification.isRead ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-2 rounded-full ${getColorClasses(
                      notification.color,
                      notification.isRead
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4
                          className={`font-medium ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorNotifications;

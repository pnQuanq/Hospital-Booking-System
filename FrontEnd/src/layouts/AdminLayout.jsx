import React from "react";
import AdminNavbar from "../components/AdminNavbar.jsx";
import AdminSideBar from "../components/AdminSideBar.jsx";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar />
      <div className="flex flex-1 bg-[#F8F9FD]">
        {/* Admin Sidebar */}
        <div className="flex-shrink-0">
          <AdminSideBar />
        </div>

        {/* Main Content Section */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
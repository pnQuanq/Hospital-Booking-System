import React, { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";

const DoctorPatient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("AToken");
      const response = await fetch("http://localhost:5000/api/doctor/get-patients", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();

      // Map API response to match UI expectations
      const formatted = data.map((p) => ({
        id: p.patientId,
        name: p.fullName,
        condition: p.gender || "N/A",
        lastVisit: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "Unknown",
        status: "Active", // You can change this based on logic
      }));

      setPatients(formatted);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">{patient.condition}</p>
                <p className="text-xs text-gray-500">
                  Last visit: {patient.lastVisit}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm font-medium text-blue-600">
                {patient.status}
              </span>
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorPatient;

import React, { useEffect, useState } from "react";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    specialtyId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const doctorsPerPage = 8;

  const fetchSpecialties = async () => {
    try {
      const token = localStorage?.getItem("AToken") || "";
      const response = await fetch(
        "http://localhost:5000/api/admin/get-all-specialty",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      alert("Failed to fetch specialties");
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("AToken");
        const response = await fetch(
          "http://localhost:5000/api/admin/get-all-doctors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
    fetchSpecialties(); // Add this line to fetch specialties on mount
  }, []);

  const changeAvailability = async (doctorId, currentAvailability) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doc) =>
        doc.doctorId === doctorId
          ? { ...doc, isAvailable: !currentAvailability }
          : doc
      )
    );

    try {
      const token = localStorage.getItem("AToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/update-doctor",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId,
            isAvailable: !currentAvailability,
          }),
        }
      );

      if (!response.ok) {
        setDoctors((prevDoctors) =>
          prevDoctors.map((doc) =>
            doc.doctorId === doctorId
              ? { ...doc, isAvailable: currentAvailability }
              : doc
          )
        );
        console.error("Failed to update doctor availability");
      }
    } catch (error) {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) =>
          doc.doctorId === doctorId
            ? { ...doc, isAvailable: currentAvailability }
            : doc
        )
      );
      console.error("Error updating availability:", error);
    }
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      password: "",
      specialtyId: doctor.specialtyId || "",
    });
    setIsModalOpen(true);
  };

  const handleSpecialtyChange = (e) => {
    setFormData({
      ...formData,
      specialtyId: parseInt(e.target.value) || "",
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("AToken");
      const updateData = {
        doctorId: selectedDoctor.doctorId,
        ...(formData.password && { password: formData.password }),
        ...(formData.specialtyId && { specialtyId: formData.specialtyId }),
      };

      const response = await fetch(
        "http://localhost:5000/api/admin/update-doctor",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        // Update the doctor in the local state
        setDoctors((prevDoctors) =>
          prevDoctors.map((doc) =>
            doc.doctorId === selectedDoctor.doctorId
              ? {
                  ...doc,
                  specialtyId: formData.specialtyId || doc.specialtyId,
                  // Update specialty description based on new specialty
                  specialtyDescription: formData.specialtyId
                    ? specialties.find((s) => s.id === formData.specialtyId)
                        ?.description || doc.specialtyDescription
                    : doc.specialtyDescription,
                }
              : doc
          )
        );

        setIsModalOpen(false);
        setSelectedDoctor(null);
        setFormData({ password: "", specialtyId: "" });
        alert("Doctor updated successfully!");
      } else {
        throw new Error("Failed to update doctor");
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert("Failed to update doctor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setFormData({ password: "", specialtyId: "" });
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doctorId.toString().includes(searchQuery)
  );

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium mb-3">All Doctors</h1>

      <input
        type="text"
        placeholder="Search by name or ID..."
        className="p-2 border border-gray-300 rounded-md w-full mb-5"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="w-full flex flex-wrap gap-4 gap-y-6">
        {currentDoctors.map((item) => (
          <div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={item.doctorId}
            onClick={() => handleDoctorClick(item)}
          >
            <img
              className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
              src={`http://localhost:5000${item.imageUrl}`}
              alt="Doctor"
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.fullName}
              </p>
              <p className="text-zinc-600 text-sm">
                {item.specialtyDescription}
              </p>
              <p className="text-zinc-400 text-xs">ID: {item.doctorId}</p>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={!!item.isAvailable}
                  onChange={(e) => {
                    e.stopPropagation();
                    changeAvailability(item.doctorId, item.isAvailable);
                  }}
                />
                <p>Available</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-4 items-center">
          <button
            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Doctor</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {selectedDoctor && (
              <div className="mb-4">
                <p className="font-medium">{selectedDoctor.fullName}</p>
                <p className="text-sm text-gray-600">
                  ID: {selectedDoctor.doctorId}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <select
                  value={formData.specialtyId}
                  onChange={handleSpecialtyChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select specialty</option>
                  {specialties.map((specialty) => (
                    <option
                      key={specialty.specialtyId}
                      value={specialty.specialtyId}
                    >
                      {specialty.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Doctor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;

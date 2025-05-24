import React, { useEffect, useState } from "react";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

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
          setCurrentPage(1); // Reset to first page on new search
        }}
      />

      <div className="w-full flex flex-wrap gap-4 gap-y-6">
        {currentDoctors.map((item, index) => (
          <div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={index}
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
                  onChange={() =>
                    changeAvailability(item.doctorId, item.isAvailable)
                  }
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
    </div>
  );
};

export default DoctorList;

import React, { useState, useEffect } from "react";

const SpecialtyManagement = () => {
  const [specialties, setSpecialties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all specialties
  useEffect(() => {
    fetchSpecialties();
  }, []);

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

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Please enter a specialty description");
      return;
    }

    setLoading(true);
    const token = localStorage?.getItem("AToken") || "";

    try {
      const formData = new FormData();
      formData.append("Description", description.trim());
      formData.append("Fee", fee.trim());

      let url = "http://localhost:5000/api/admin/add-specialty";
      let method = "POST";

      if (editingSpecialty) {
        url = "http://localhost:5000/api/admin/update-specialty";
        method = "PUT";
        formData.append("Id", editingSpecialty.specialtyId);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        resetForm();
        fetchSpecialties(); // Refresh the list
      } else {
        alert(`Failed: ${result.title || result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setDescription(specialty.description);
    setFee(specialty.fee);
    setShowForm(true);
  };

  const handleDelete = async (specialtyId) => {
    if (!window.confirm("Are you sure you want to delete this specialty?")) {
      return;
    }

    setLoading(true);
    const token = localStorage?.getItem("AToken") || "";

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/delete-specialty/${specialtyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        fetchSpecialties(); // Refresh the list
      } else {
        alert(
          `Failed to delete: ${
            result.title || result.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setFee();
    setEditingSpecialty(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="m-5 w-full">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-medium">Specialty Management</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 px-6 py-2 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add Specialty"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white px-8 py-6 border rounded-lg mb-6 max-w-2xl">
          <p className="mb-4 text-md font-medium">
            {editingSpecialty ? "Edit Specialty" : "Add New Specialty"}
          </p>

          <div>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-gray-600">Specialty Description</p>
              <input
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Enter specialty description"
                required
              />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-gray-600">Booking Fee</p>
              <input
                onChange={(e) => setFee(e.target.value)}
                value={fee}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Enter booking fee"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 px-6 py-2 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : editingSpecialty ? "Update" : "Add"}{" "}
                Specialty
              </button>

              <button
                onClick={handleCancel}
                className="bg-gray-500 px-6 py-2 text-white rounded-full hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialties List */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b">
          <p className="font-medium">All Specialties ({specialties.length})</p>
        </div>

        <div className="divide-y">
          {specialties.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No specialties found. Add your first specialty above.
            </div>
          ) : (
            specialties.map((specialty) => (
              <div
                key={specialty.specialtyId}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {specialty.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    ID: {specialty.specialtyId}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(specialty)}
                    disabled={loading}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(specialty.specialtyId)}
                    disabled={loading}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtyManagement;

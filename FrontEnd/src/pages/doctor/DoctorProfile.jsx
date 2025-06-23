import React, { useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import axios from "axios";

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState({
    doctorId: null,
    fullName: "",
    email: "",
    imageUrl: "",
    specialtyId: null,
    specialtyDescription: "",
    experienceYears: null,
    description: "",
    rating: null,
    isAvailable: true,
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/doctor/get-details",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("AToken")}`,
            },
          }
        );
        setDoctorData(response.data);
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
      }
    };

    fetchData();
  }, []);

  const handleImageClick = () => {
    if (isEdit && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setDoctorData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file), // preview only
      }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", doctorData.fullName);
      formData.append("specialtyId", doctorData.specialtyId);
      formData.append("experienceYears", doctorData.experienceYears);
      formData.append("description", doctorData.description);
      formData.append("isAvailable", doctorData.isAvailable);
      
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      await axios.put(
        "http://localhost:5000/api/doctor/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("AToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsEdit(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-2 text-sm">
      <div className="relative w-36">
        <img
          className={`w-36 h-36 object-cover rounded cursor-${
            isEdit ? "pointer" : "default"
          }`}
          src={`http://localhost:5000${doctorData.imageUrl}` || assets.default_profile_pic}
          alt="Profile"
          onClick={handleImageClick}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </div>

      {isEdit ? (
        <input
          className="bg-gray-50 text-3xl font-medium max-w-60 mt-4"
          type="text"
          value={doctorData.fullName}
          onChange={(e) =>
            setDoctorData((prev) => ({ ...prev, fullName: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {doctorData.fullName}
        </p>
      )}

      <hr className="border-none bg-zinc-400 h-[1px]" />

      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{doctorData.email}</p>

          <p className="font-medium">Address Line 1:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={doctorData.address?.line1 || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ 
                  ...prev, 
                  address: { ...prev.address, line1: e.target.value }
                }))
              }
            />
          ) : (
            <p className="text-gray-400">{doctorData.address?.line1 || "N/A"}</p>
          )}

          <p className="font-medium">Address Line 2:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={doctorData.address?.line2 || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ 
                  ...prev, 
                  address: { ...prev.address, line2: e.target.value }
                }))
              }
            />
          ) : (
            <p className="text-gray-400">{doctorData.address?.line2 || "N/A"}</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              value={doctorData.gender || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{doctorData.gender || "N/A"}</p>
          )}

          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              value={
                doctorData.dateOfBirth ? doctorData.dateOfBirth.slice(0, 10) : ""
              }
              onChange={(e) =>
                setDoctorData((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
            />
          ) : (
            <p className="text-gray-400">
              {doctorData.dateOfBirth ? doctorData.dateOfBirth.slice(0, 10) : "N/A"}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="text-neutral-500 underline mt-3">PROFESSIONAL INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Speciality:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={doctorData.speciality || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, speciality: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{doctorData.speciality || "N/A"}</p>
          )}

          <p className="font-medium">Degree:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={doctorData.degree || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, degree: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{doctorData.degree || "N/A"}</p>
          )}

          <p className="font-medium">Experience:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-24"
              type="text"
              value={doctorData.experience || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, experience: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{doctorData.experience || "N/A"}</p>
          )}

          <p className="font-medium">Fees:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-24"
              type="number"
              value={doctorData.fees || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, fees: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">${doctorData.fees || "N/A"}</p>
          )}

          <p className="font-medium">About:</p>
          {isEdit ? (
            <textarea
              className="bg-gray-100 max-w-52 min-h-20"
              value={doctorData.about || ""}
              onChange={(e) =>
                setDoctorData((prev) => ({ ...prev, about: e.target.value }))
              }
              rows="3"
            />
          ) : (
            <p className="text-gray-400">{doctorData.about || "N/A"}</p>
          )}
        </div>
      </div>

      <div className="mt-10">
        {isEdit ? (
          <button
            className="cursor-pointer border border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
            onClick={handleSave}
          >
            Save
          </button>
        ) : (
          <button
            className="cursor-pointer border border-blue-600 px-8 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all"
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
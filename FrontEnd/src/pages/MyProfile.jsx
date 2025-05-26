import React, { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    imageUrl: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    weight: null,
    height: null,
    allergy: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/patient/get-details",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("AToken")}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
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
      setUserData((prev) => ({
        ...prev,
        imageUrl: URL.createObjectURL(file), // preview only
      }));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", userData.fullName);
      formData.append("gender", userData.gender);
      formData.append("dateOfBirth", userData.dateOfBirth);
      formData.append("weight", userData.weight);
      formData.append("height", userData.height);
      formData.append("allergy", userData.allergy);
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      await axios.put(
        "http://localhost:5000/api/patient/update-profile",
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
          src={`http://localhost:5000${userData.imageUrl}` || assets.default_profile_pic}
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
          value={userData.fullName}
          onChange={(e) =>
            setUserData((prev) => ({ ...prev, fullName: e.target.value }))
          }
        />
      ) : (
        <p className="font-medium text-3xl text-neutral-800 mt-4">
          {userData.fullName}
        </p>
      )}

      <hr className="border-none bg-zinc-400 h-[1px]" />

      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{userData.email}</p>

          <p className="font-medium">Allergy:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={userData.allergy || ""}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, allergy: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{userData.allergy || "N/A"}</p>
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
              value={userData.gender || ""}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender || "N/A"}</p>
          )}

          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              value={
                userData.dateOfBirth ? userData.dateOfBirth.slice(0, 10) : ""
              }
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
            />
          ) : (
            <p className="text-gray-400">
              {userData.dateOfBirth ? userData.dateOfBirth.slice(0, 10) : "N/A"}
            </p>
          )}

          <p className="font-medium">Weight:</p>
          {isEdit ? (
            <input
              className="max-w-24 bg-gray-100"
              type="number"
              value={userData.weight || ""}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, weight: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{userData.weight || "N/A"} kg</p>
          )}

          <p className="font-medium">Height:</p>
          {isEdit ? (
            <input
              className="max-w-24 bg-gray-100"
              type="number"
              value={userData.height || ""}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, height: e.target.value }))
              }
            />
          ) : (
            <p className="text-gray-400">{userData.height || "N/A"} cm</p>
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

export default MyProfile;

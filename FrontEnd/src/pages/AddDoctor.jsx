import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [Specialty, setSpecialty] = useState("");

  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/get-all-specialty"
        );
        const data = await response.json();
        setSpecialties(data);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      }
    };

    fetchSpecialties();
  }, []);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validation
    if (!docImg) {
      alert("Please upload a doctor image");
      return;
    }
    if (!Specialty) {
      alert("Please select a specialty");
      return;
    }

    const formData = new FormData();
    formData.append("doctorImage", docImg);
    formData.append("fullName", name);
    formData.append("email", email); // Changed from "Email" to "email"
    formData.append("password", password);
    formData.append("experience", parseInt(experience, 10)); // Parse as integer
    formData.append("description", description);
    formData.append("specialtyId", parseInt(Specialty, 10));

    const token = localStorage.getItem("AToken");
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/add-doctor",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        // Reset form
        setDocImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("");
        setDescription("");
        setSpecialty("");
      } else {
        alert(
          "Failed to add doctor: " +
            (result.title || result.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border-white rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer "
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
            />
          </label>

          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            accept="image/*"
            hidden
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="border rounded px-3 py-2"
                type="text"
                placeholder="Name"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border rounded px-3 py-2"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Doctor password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border rounded px-3 py-2"
                type="password"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>Experience</p>
              <input
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="border rounded px-3 py-2"
                type="number"
                placeholder="Experience (years)"
                min="0"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Specialty</p>
              <select
                onChange={(e) => setSpecialty(e.target.value)}
                value={Specialty}
                className="border rounded px-3 py-2"
                required
              >
                <option value="">Select a specialty</option>
                {specialties.map((spec) => (
                  <option key={spec.specialtyId} value={spec.specialtyId}>
                    {spec.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <p className="mt-4 mb-2">Description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full px-4 pt-2 border rounded"
            rows={5}
            placeholder="Write about doctor"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 px-10 py-3 mt-4 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;

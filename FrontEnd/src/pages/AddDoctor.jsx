import React, { useState } from "react";
import { assets } from "../assets/assets";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [Specialty, setSpecialty] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border-white rounded w-full max-w-4xl max-h-[80h] overflow-y-scroll">
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
                className="border-white rounded px-3 py-2"
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
                className="border-white rounded px-3 py-2"
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
                className="border-white rounded px-3 py-2"
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
                className="border-white rounded px-3 py-2"
                type="number"
                placeholder="Experience"
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <p>Specialty</p>
              <select
                onChange={(e) => setSpecialty(e.target.value)}
                value={Specialty}
                className="border-white rounded px-3 py-2"
                name=""
                id=""
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <p className="mt-4 mb-2">Description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full px-4 pt-2 border-white rounded"
            rows={5}
            placeholder="Write about doctor"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 px-10 py-3 mt-4 text-white rounded-full cursor-pointer"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;

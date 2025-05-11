import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const url =
      state === "Sign Up"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    const data = {
      email: email,
      password: password,
      fullName: name,
      rePassword: rePassword,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      if (state === "Sign Up") {
        alert(result.message || "Account created successfully");
        setState("Login");
        window.setTimeout(() => {
          navigate("/login"); // Redirect to login after alert OK
        }, 500);
      } else {
        localStorage.setItem("AToken", result.token);

        // Decode the JWT token to extract user role
        const decoded = jwtDecode(result.token);
        console.log("Decoded token:", decoded); // Log the full decoded token for debugging
        
        // Extract the role from the "Role" property based on your token structure
        const role = decoded.Role;
        console.log("Extracted role:", role);
        
        // Check if the user is an Admin
        const isAdmin = role === "Admin";

        // Set isAdmin in localStorage
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
        console.log("isAdmin set in localStorage:", isAdmin);
        
        // Show login successful message
        alert("Login successful as " + (isAdmin ? "Administrator" : "Patient"));
        
        // Redirect based on role with delayed execution to ensure state is updated
        if (isAdmin) {
          console.log("Admin login detected, navigating to admin dashboard");
          // Use setTimeout to ensure the navigation happens after the current execution cycle
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 100);
        } else {
          console.log("Patient login detected, navigating to home");
          setTimeout(() => {
            navigate("/");
          }, 100);
        }

        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event("storage"));
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong");
    }
  };
  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold ">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "sign up" : "login"} to book appointment
        </p>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>
        {state === "Sign Up" && (
          <div className="w-full">
            <p>Re-enter Password</p>
            <input
              className="border border-zinc-300 rounded w-full p-2 mt-1"
              type="password"
              onChange={(e) => setRePassword(e.target.value)}
              value={rePassword}
              required
            />
          </div>
        )}
        <button className="cursor-pointer bg-blue-600 text-white w-full py-2 rounded-md text-base">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-600 underline cursor-pointer"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            create an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-600 underline cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
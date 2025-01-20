import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { CircularProgress } from "@mui/material";
import { useNavigate, Link } from "react-router";
import { GitHub, Google } from "@mui/icons-material";
import { UserContext } from "../Context/user.context";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setRegisterError(null);

    try {
      const response = await fetch("http://localhost:3000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        setRegisterError(error.message);
        setTimeout(() => setRegisterError(null), 5000);
      } else {
        const res = await response.json();
        setUser(res.user);
        navigate("/");
      }
    } catch (error) {
      setRegisterError(error.message);
      setTimeout(() => setRegisterError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-12 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        {/* Registration Error */}
        {registerError && (
          <p className="text-red-500 text-sm mt-3 text-center">
            {registerError}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-600">Username</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <input
                type="text"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 5,
                    message: "Username must be at least 5 characters",
                  },
                })}
                className="outline-none w-full"
                placeholder="Enter your username"
                aria-invalid={errors.username ? "true" : "false"}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-600">Email</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <EmailIcon className="text-gray-500 mr-2" />
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                    message: "Please enter a valid email",
                  },
                })}
                className="outline-none w-full"
                placeholder="Enter your email"
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-gray-600">Password</label>
            <div className="flex items-center border rounded-md px-3 py-2">
              <LockIcon className="text-gray-500 mr-2" />
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="outline-none w-full"
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} className="mx-auto" />
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Footer with Redirect to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="w-10 h-10 bg-gray-800 text-white py-2 px-4 rounded-full flex items-center justify-center hover:bg-gray-900 transition duration-300"
            onClick={() => console.log("Sign up with GitHub")}
          >
            <GitHub className="text-white" />
          </button>
          <button
            className="w-10 h-10 bg-red-500 text-white py-2 px-4 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-300"
            onClick={() => console.log("Sign up with Google")}
          >
            <Google className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

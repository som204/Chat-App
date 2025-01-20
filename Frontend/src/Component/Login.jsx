import React, { useState,useContext } from "react";
import { useForm } from "react-hook-form";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { CircularProgress } from "@mui/material";
import { useNavigate,Link } from "react-router";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import { UserContext } from "../Context/user.context";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {setUser}=useContext(UserContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError(null);

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        credentials:"include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        setLoginError(error.message);
        setTimeout(() => setLoginError(null), 5000);
      } else {
        const res = await response.json();
        setUser(res.user);
        navigate("/");
      }
    } catch (error) {
      setLoginError(error.message);
      setTimeout(() => setLoginError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 mt-20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {/* Login Error */}
        {loginError && (
            <p className="text-red-500 text-sm mt-3 text-center">{loginError}</p>
          )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                type={showPassword ? "text" : "password"}
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
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
              "Login"
            )}
          </button>
        </form>

        {/* Footer with Social Login */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
          <div className="mt-4 flex justify-center gap-4">
            {/* Google Login Button with Icon */}
            <button className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition duration-300">
              <GoogleIcon />
            </button>

            {/* GitHub Login Button with Icon */}
            <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition duration-300">
              <GitHubIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

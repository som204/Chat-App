import React, { useState, useEffect } from "react";
import { Code, People, Assistant, AccountCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in by checking the token in cookies
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 min-h-screen text-white">
      {/* Navigation Bar */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Codeless</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="#features" className="hover:text-gray-300">
                Features
              </Link>
            </li>
            <li>
              <Link to="#about" className="hover:text-gray-300">
                About
              </Link>
            </li>
            <li>
              <Link to="#contact" className="hover:text-gray-300">
                Contact
              </Link>
            </li>
            {/* Conditionally render Login/Register or Profile button */}
            {!isLoggedIn ? (
              <li>
                <Link to="/login" className="hover:text-gray-300">
                  Login / Register
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  to="/home"
                  className="flex items-center hover:text-gray-300"
                >
                  <AccountCircle className="mr-2" />
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-32">
        <h2 className="text-5xl font-semibold mb-6">
          Build Projects Together, Effortlessly
        </h2>
        <p className="text-lg mb-8">
          Codeless is the platform for creating and collaborating on projects.
          Add teammates to your groups and develop real-time code with our AI
          assistant.
        </p>
        {isLoggedIn ? (
          <Link
            to="/home"
            className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-md text-lg"
          >
            Build Your First Project
          </Link>
        ) : (
          <Link
            to="/register"
            className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-md text-lg"
          >
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <h3 className="text-center text-4xl font-semibold text-gray-100 mb-10">
          Key Features
        </h3>
        <div className="flex justify-around">
          <div className="text-center max-w-xs">
            <Code
              className="mx-auto mb-4 text-blue-500"
              style={{ fontSize: "48px" }}
            />
            <h4 className="text-xl font-semibold mb-2">Code with AI</h4>
            <p className="text-gray-300">
              Generate and preview code for your projects instantly. Let our AI
              assistant write your code.
            </p>
          </div>
          <div className="text-center max-w-xs">
            <People
              className="mx-auto mb-4 text-blue-500"
              style={{ fontSize: "48px" }}
            />
            <h4 className="text-xl font-semibold mb-2">Team Collaboration</h4>
            <p className="text-gray-300">
              Invite your friends or colleagues to work on projects, share
              tasks, and achieve together.
            </p>
          </div>
          <div className="text-center max-w-xs">
            <Assistant
              className="mx-auto mb-4 text-blue-500"
              style={{ fontSize: "48px" }}
            />
            <h4 className="text-xl font-semibold mb-2">Live Preview</h4>
            <p className="text-gray-300">
              See live previews of your project changes with instant feedback
              and improvements.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white text-gray-800">
        <div className="max-w-screen-xl mx-auto px-6">
          <h3 className="text-center text-4xl font-semibold mb-6">
            About Codeless
          </h3>
          <p className="text-lg mb-4">
            Codeless is the platform built for developers and teams to
            collaborate seamlessly. Whether you're working on a personal project
            or a team-based initiative, Codeless provides the tools and features
            you need to be productive.
          </p>
          <p className="text-lg">
            Our mission is to make development faster, easier, and more
            collaborative. With AI assistance, live previews, and integrated
            team management, you can focus more on building and less on setup.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <h3 className="text-center text-4xl font-semibold mb-6">Contact Us</h3>
        <p className="text-center mb-6">
          Have questions? Reach out to us and we’ll be happy to assist you!
        </p>
        <div className="text-center">
          <Link
            to="mailto:contact@codeless.com"
            className="bg-blue-700 hover:bg-blue-800 py-2 px-6 rounded-md"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-white text-center py-4">
        <p>&copy; 2025 Codeless. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;

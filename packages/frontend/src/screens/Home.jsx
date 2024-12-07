import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";

const Home = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 min-h-screen flex flex-col justify-between">
      {/* Main Header Section */}
      <header className="text-center px-6 py-16 flex-grow">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          AI-Powered Group Discussions
        </h1>
        <p className="text-xl sm:text-2xl text-white mb-8 max-w-2xl mx-auto">
          Enhance your speaking skills and boost your confidence with AI-driven group discussions. Join a session, engage with intelligent AI models, and improve your communication skills.
        </p>
        <div className="flex justify-center space-x-6">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-600 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-white hover:text-blue-600"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/gd"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-600 hover:text-white"
              >
                Create GD
              </Link>
              <div
                onClick={logout}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold cursor-pointer transition-all hover:bg-white hover:text-blue-600"
              >
                Logout
              </div>
            </>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="w-full bg-white text-gray-800 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-8">Why AI-Powered Discussions?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="feature-item p-8 bg-gray-100 rounded-lg shadow-xl transition-all hover:shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4">Interactive Sessions</h3>
              <p>
                Engage with multiple AI models during group discussions, gaining valuable insights and feedback to improve your communication skills.
              </p>
            </div>
            <div className="feature-item p-8 bg-gray-100 rounded-lg shadow-xl transition-all hover:shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4">Instant Feedback</h3>
              <p>
                Receive real-time analysis of your speaking skills and suggestions for improvement from AI models tailored to your needs.
              </p>
            </div>
            <div className="feature-item p-8 bg-gray-100 rounded-lg shadow-xl transition-all hover:shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4">Boost Confidence</h3>
              <p>
                With every session, build your confidence in public speaking and improve your articulation and presentation skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-gray-900 text-center py-4 text-white">
        <p>&copy; {new Date().getFullYear()} AI Group Discussions. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

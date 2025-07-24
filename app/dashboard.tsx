"use client";

import React, { useState } from "react";
import { LogOut } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("https://backend.vibesec.app/api/v2/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        // Clear any client-side state or cookies if needed
        window.location.href = "/";
      } else {
        console.error("Logout failed:", await response.json());
        alert("Failed to log out. Please try again.");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Your Dashboard</h1>
        <p className="text-gray-600 mb-6">You are successfully logged in!</p>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center mx-auto ${
            isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {isLoggingOut ? "Logging Out..." : "Log Out"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
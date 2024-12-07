import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { getUserDetails, updateUser } from "../utils/api-call";

const Profile = () => {
  const [details, setDetails] = useState({ name: "" }); 

  const { data, isLoading, error: userDetailsError } = useQuery(
    ["user-details"],
    getUserDetails,
    {
      onSuccess: (data) => {
        if (data) {
          setDetails({ name: data.name || "" }); 
        }
      },
    }
  );

  const { mutate, error: updateError } = useMutation(updateUser, {
    onSuccess: (data) => {
      alert(`Profile updated successfully: ${data.name}`);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.name.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    mutate(details); 
  };

  if(isLoading){
    return(
        <div>Loading.....</div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Profile Page
      </h1>

      {isLoading && <p>Loading...</p>}
      {userDetailsError && (
        <p className="text-red-500">Error fetching user details.</p>
      )}

      {!isLoading && !userDetailsError && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Name:
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={details.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Update Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;

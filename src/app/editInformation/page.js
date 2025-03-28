"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function EditProfilePage() {
  const [name, setName] = useState("User Name");
  const [email, setEmail] = useState("user@example.com");
  const [telephone, setTelephone] = useState("123-456-7890");
  const [address, setAddress] = useState("123 Street, City, Country");
  const [bio, setBio] = useState("This is my bio.");
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Changes Saved Successfully!");
  };

  const handleCancel = () => {
    router.push("/lmsMainPage");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header username={name} title="Edit User Information" />
      <main
        className="flex-grow p-8 pt-13 flex flex-col items-center"
        style={{
          backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        >
          <div className="mb-4 text-center">
            {profilePicture && (
              <img
                src={profilePicture}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
            )}
            <input type="file" onChange={handleProfilePictureChange} />
          </div>

          <label className="block mb-2">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-2">Telephone:</label>
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-2">Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-2">Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <div className="mb-4">
            <label className="mr-2">Change Password:</label>
            <input
              type="checkbox"
              checked={changePassword}
              onChange={() => setChangePassword(!changePassword)}
            />
          </div>

          {changePassword && (
            <>
              <label className="block mb-2">New Password:</label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border p-2 rounded pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              <label className="block mb-2">Confirm New Password:</label>
              <div className="relative mb-4">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full border p-2 rounded pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
            </>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button
              text="Save Changes"
              type="submit"
              className="text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400 py-2 rounded w-42"
            />
            <Button
              text="Cancel"
              type="button"
              onClick={handleCancel}
              className="text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400 py-2 rounded w-28"
            />
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const NavBar = ({ username }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigateToEditProfile = () => {
    router.push("/editInformation");
  };

  return (
    <header className="border-b-2 border-slate-950 bg-white shadow-lg p-6 flex justify-between items-center">
      <div className="text-2xl font-bold text-slate-900">Cloud LMS</div>
      <div
        className="flex items-center gap-4 flex-wrap justify-end relative"
        ref={dropdownRef}
      >
        <span className="text-md text-slate-950 truncate max-w-[200px]">
          Hello, {username}!
        </span>
        <button
          onClick={toggleDropdown}
          className="rounded-lg delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100 border-2 text-slate-950 border-slate-900 px-5 py-2 bg-blue-300 font-bold hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
        >
          Account ▼
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border shadow-md z-10">
            <div
              className="hover:bg-indigo-100 cursor-pointer p-2"
              onClick={navigateToEditProfile}
            >
              Edit Information
            </div>
            <div
              className="hover:bg-indigo-100 cursor-pointer p-2"
              onClick={() => alert("Logout")}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;

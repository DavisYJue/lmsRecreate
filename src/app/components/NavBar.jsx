"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) throw new Error("Failed to fetch user");

        const userData = await response.json();
        setUsername(userData.username);
      } catch (error) {
        console.error("Error fetching user:", error);

        // Redirect to login with error message
        router.push("/?error=relogin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b-2 border-slate-950 bg-white shadow-lg p-6 flex justify-between items-center">
      <div className="text-2xl font-bold text-slate-900">Cloud LMS</div>
      <div
        className="flex items-center gap-4 flex-wrap justify-end relative"
        ref={dropdownRef}
      >
        {!isLoading && (
          <span className="text-md text-slate-950 truncate max-w-[200px]">
            Hello, {username} !
          </span>
        )}
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
              onClick={() => router.push("/editInformation")}
            >
              Edit Information
            </div>
            <div
              className="hover:bg-indigo-100 cursor-pointer p-2"
              onClick={handleLogout}
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

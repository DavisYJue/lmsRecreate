"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import CourseList from "../components/CourseList";
import Filter from "../components/Filter";
import Footer from "../components/Footer";

export default function LmsMainPage() {
  const [filter, setFilter] = useState("all");
  const username = "User";
  const router = useRouter();

  const yourCourses = [
    {
      id: 1,
      title: "Course Title 1",
      dateRange: "Jan 2025 - Mar 2025",
      status: "ongoing",
      imageUrl: "https://via.placeholder.com/300x200.png?text=Course+Image+1",
    },
    {
      id: 2,
      title: "Course Title 2",
      dateRange: "Nov 2024 - Dec 2024",
      status: "completed",
      imageUrl: "https://via.placeholder.com/300x200.png?text=Course+Image+2",
    },
    {
      id: 3,
      title: "Course Title 3",
      dateRange: "Feb 2025 - Apr 2025",
      status: "ongoing",
      imageUrl: "https://via.placeholder.com/300x200.png?text=Course+Image+3",
    },
  ];

  const publicCourses = [
    {
      id: 4,
      title: "Public Course 1",
      dateRange: "Mar 2025 - Jun 2025",
      status: "ongoing",
      imageUrl: "https://via.placeholder.com/300x200.png?text=Public+Course+1",
    },
    {
      id: 5,
      title: "Public Course 2",
      dateRange: "May 2025 - Aug 2025",
      status: "upcoming",
      imageUrl: "https://via.placeholder.com/300x200.png?text=Public+Course+2",
    },
  ];

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredYourCourses = yourCourses.filter(
    (course) => filter === "all" || course.status === filter
  );
  const filteredPublicCourses = publicCourses.filter(
    (course) => filter === "all" || course.status === filter
  );

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-gray-100 flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <NavBar username={username} />
      <main className="flex-grow p-8 flex flex-col">
        <Filter filter={filter} onChange={handleFilterChange} />

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Your Courses
        </h2>
        {filteredYourCourses.length > 0 ? (
          <CourseList courses={filteredYourCourses} />
        ) : (
          <div className="flex flex-col justify-center items-center">
            <img
              src="/nothingHere.webp"
              alt="Nothing to display"
              className="w-32 h-auto opacity-50"
            />
            <p className="text-gray-500 mt-4">
              No courses available for the selected filter.
            </p>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
          Public Courses
        </h2>
        {filteredPublicCourses.length > 0 ? (
          <CourseList courses={filteredPublicCourses} />
        ) : (
          <div className="flex flex-col justify-center items-center">
            <img
              src="/nothingHere.webp"
              alt="Nothing to display"
              className="w-32 h-auto opacity-50"
            />
            <p className="text-gray-500 mt-4">
              No public courses available for the selected filter.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

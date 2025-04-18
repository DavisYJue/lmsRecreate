"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import CourseList from "../components/CourseList";
import Filter from "../components/Filter";
import Footer from "../components/Footer";

export default function LmsMainPage() {
  const [filter, setFilter] = useState("all");
  const [username, setUsername] = useState("");
  const [yourCourses, setYourCourses] = useState([]);
  const [publicCourses, setPublicCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const fetchUserDataAndCourses = async () => {
    try {
      const userRes = await fetch("/api/user");
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const user = await userRes.json();
      setUsername(user.username);

      const enrolledRes = await fetch("/api/courses/enrolled");
      if (!enrolledRes.ok) throw new Error("Failed to fetch enrolled courses");
      const enrolled = await enrolledRes.json();

      const publicRes = await fetch("/api/courses/public");
      if (!publicRes.ok) throw new Error("Failed to fetch public courses");
      const publicList = await publicRes.json();

      const enrolledIds = new Set(enrolled.map((c) => c.course_id));
      const filteredPublic = publicList
        .filter((course) => !enrolledIds.has(course.course_id))
        .map((course) => ({ ...course, isEnrolled: false }));

      const enrichedEnrolled = enrolled.map((course) => ({
        ...course,
        isEnrolled: true,
      }));

      setPublicCourses(filteredPublic);
      setYourCourses(enrichedEnrolled);
    } catch (err) {
      console.error("Error:", err.message);
      router.push("/?error=relogin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndCourses();
  }, [router]);

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        fetchUserDataAndCourses();
      } else {
        const err = await res.json();
        alert(err.error || err.message || "Failed to enroll");
        console.error("Failed to enroll:", err);
      }
    } catch (err) {
      console.error("Enrollment error:", err);
    }
  };

  const filteredYourCourses = yourCourses.filter(
    (course) => filter === "all" || course.status === filter
  );
  const filteredPublicCourses = publicCourses.filter(
    (course) => filter === "all" || course.status === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

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
        <CourseList courses={filteredYourCourses} />
        <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">
          Public Courses
        </h2>
        <CourseList courses={filteredPublicCourses} onEnroll={handleEnroll} />
      </main>
      <Footer />
    </div>
  );
}

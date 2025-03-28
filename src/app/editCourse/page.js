"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const EditCourse = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public"); // New state for visibility

  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        // Simulated course data (Replace with API call)
        const courseData = {
          courseTitle: "Sample Course",
          courseDescription: "This is a sample course description.",
          startDate: "2025-04-01",
          endDate: "2025-06-30",
          courseVisibility: "private", // Simulated existing visibility
        };
        setCourseTitle(courseData.courseTitle);
        setCourseDescription(courseData.courseDescription);
        setStartDate(courseData.startDate);
        setEndDate(courseData.endDate);
        setCourseVisibility(courseData.courseVisibility);
      };

      fetchCourseData();
    }
  }, [courseId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCourseImage(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!courseTitle || !courseDescription || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }

    // Simulate saving course update (Replace with API call)
    console.log("Course Updated:", {
      courseId,
      courseTitle,
      courseDescription,
      courseImage,
      startDate,
      endDate,
      courseVisibility,
    });

    // Redirect to Manage Course page
    router.push("/manageCourse");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Edit Course Information" />

      <main className="max-w-3xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Edit Course</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">
              Course Title
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">
              Course Description
            </label>
            <textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="w-full min-h-48 p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">
              Course Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">
              Course Duration
            </label>
            <div className="flex gap-4">
              <div>
                <label className="text-gray-600 text-sm">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* New Course Visibility Section */}
          <div>
            <label className="block text-gray-700 font-semibold">
              Course Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="public"
                  checked={courseVisibility === "public"}
                  onChange={() => setCourseVisibility("public")}
                  className="mr-2"
                />
                Public
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="private"
                  checked={courseVisibility === "private"}
                  onChange={() => setCourseVisibility("private")}
                  className="mr-2"
                />
                Private
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <Button
              type="submit"
              text="Update Course"
              className="px-4 py-2 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
            />
            <Button
              onClick={() => router.push("/manageMainPage")}
              text="Cancel"
              className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
            />
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditCourse;

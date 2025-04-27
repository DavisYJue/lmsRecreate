"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const AddCourse = () => {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseVisibility, setCourseVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
    }
    setCourseImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!courseTitle || !courseDescription || !startDate || !endDate) {
        alert("Please fill in all required fields.");
        return;
      }

      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        alert("End date must be after start date");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("courseTitle", courseTitle);
      formData.append("courseDescription", courseDescription);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("courseVisibility", courseVisibility);
      if (courseImage) formData.append("courseImage", courseImage);

      // Submit to API
      const response = await fetch("/api/courses/add", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Course created successfully!"); // Added success alert
        router.push("/manageMainPage");
      } else {
        alert(data.error || "Failed to add course. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Add New Course" />

      <main className="max-w-3xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">
          Add New Course
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Title */}
          <div>
            <label className="block text-gray-700 font-semibold">
              Course Title *
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter course title"
              required
            />
          </div>

          {/* Course Description */}
          <div>
            <label className="block text-gray-700 font-semibold">
              Course Description *
            </label>
            <textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="w-full min-h-48 p-2 border border-gray-300 rounded-md"
              placeholder="Enter course description"
              required
            />
          </div>

          {/* Course Image */}
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
            <p className="text-sm text-gray-500 mt-1">
              Maximum file size: 10MB (JPEG, PNG, GIF)
            </p>
          </div>

          {/* Course Duration */}
          <div>
            <label className="block text-gray-700 font-semibold">
              Course Duration *
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-gray-600 text-sm">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex-1">
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

          {/* Course Visibility */}
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

          {/* Form Actions */}
          <div className="mt-6 flex gap-2 justify-end">
            <Button
              type="submit"
              text={isSubmitting ? "Saving..." : "Add Course"}
              disabled={isSubmitting}
              className={`px-4 py-2 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
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

export default AddCourse;

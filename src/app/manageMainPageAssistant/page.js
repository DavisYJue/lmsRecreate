"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Link from "next/link";
import ConfirmationPopup from "../components/ConfirmationPopup";
import EmptyState from "../components/EmptyState";

const ManageMainPageAssistant = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses/taught", { cache: "no-store" });

        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await res.json();
        setCourses(data.courses);
      } catch (error) {
        console.error("Error loading courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const confirmDeleteCourse = (id) => {
    setSelectedCourseId(id);
    setIsConfirmPopupOpen(true);
  };

  const handleDeleteCourse = () => {
    setCourses(
      courses.filter((course) => course.course_id !== selectedCourseId)
    );
    setIsConfirmPopupOpen(false);
  };

  const handleAddCourse = () => {
    router.push("/addCourse");
  };

  const handleManageCourseStudent = () => {
    router.push("/manageStudent");
  };

  const handleManageCourseTA = () => {
    router.push("/manageAssistance");
  };

  const handleManageCourseMaterial = () => {
    router.push("/manageMaterial");
  };

  const handleManageCourseAssignment = () => {
    router.push("/manageAssignment");
  };

  const handleEditCourse = async (courseData) => {
    try {
      const response = await fetch("/api/courses/setSelectedManage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseData.course_id }),
      });

      if (!response.ok) throw new Error("Failed to set course");
      router.push("/editCourse");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleManageClick = async (courseId, courseData) => {
    try {
      const response = await fetch("/api/courses/setSelectedManage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) throw new Error("Failed to set course");
      sessionStorage.setItem("selectedCourseId", courseId);

      setSelectedCourseData(courseData);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Manage Course" />

      <main className="flex-grow max-w-4xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">
          Manage Your Courses
        </h2>

        <ul className="divide-y">
          {courses.length > 0 ? (
            courses.map((course) => (
              <li
                key={course.course_id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    {course.course_title}
                  </h3>
                  <p className="text-gray-700">{course.course_description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleManageClick(course.course_id, course)}
                    text="Manage"
                    className="px-3 py-1 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                  />
                </div>
              </li>
            ))
          ) : (
            <EmptyState message="No courses found. Start by creating your first course !" />
          )}
        </ul>
      </main>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
          <div className="bg-white border-3 px-6 py-3 rounded-lg shadow-lg w-115 h-65 text-center">
            <h3 className="text-xl font-bold mb-4">Manage Course</h3>
            <p className="mb-4">What do you want to manage?</p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => handleManageCourseMaterial()}
                  text="Manage Teaching Material"
                  className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                />

                <Button
                  onClick={() => handleManageCourseAssignment()}
                  text="Manage Course's Assignments"
                  className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                text="Close"
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
              />
            </div>
          </div>
        </div>
      )}

      {isConfirmPopupOpen && (
        <ConfirmationPopup
          title="Confirm Deletion"
          message="Are you sure you want to delete this course? This action cannot be undone."
          onConfirm={handleDeleteCourse}
          onCancel={() => setIsConfirmPopupOpen(false)}
        />
      )}

      <div className="flex justify-center">
        <Button
          text="Back"
          onClick={() => router.push("/lmsMainPage")}
          className="w-25 mb-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ManageMainPageAssistant;

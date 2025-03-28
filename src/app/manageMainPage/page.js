"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Link from "next/link";
import ConfirmationPopup from "../components/ConfirmationPopup"; // Import ConfirmationPopup

const ManageMainPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Cloud Computing",
      description: "Learn the basics of cloud computing.",
    },
    {
      id: 2,
      title: "Advanced Cloud Architectures",
      description: "Deep dive into modern cloud solutions.",
    },
    {
      id: 3,
      title: "Cloud Project Management",
      description: "Manage cloud projects efficiently.",
    },
  ]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false); // Confirmation state

  const handleManageClick = (courseId) => {
    setSelectedCourseId(courseId);
    setIsPopupOpen(true);
  };

  const confirmDeleteCourse = (id) => {
    setSelectedCourseId(id);
    setIsConfirmPopupOpen(true);
  };

  const handleDeleteCourse = () => {
    setCourses(courses.filter((course) => course.id !== selectedCourseId));
    setIsConfirmPopupOpen(false);
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

        <div className="mb-4">
          <Link href="/addCourse">
            <Button
              text="Add New Course"
              className="px-4 py-2 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
            />
          </Link>
        </div>

        <ul className="divide-y">
          {courses.map((course) => (
            <li
              key={course.id}
              className="py-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{course.title}</h3>
                <p className="text-gray-700">{course.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/teacher/edit-course/${course.id}`}>
                  <Button
                    text="Edit"
                    className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                  />
                </Link>
                <Button
                  onClick={() => confirmDeleteCourse(course.id)}
                  text="Delete"
                  className="px-3 py-1 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                />
                <Button
                  onClick={() => handleManageClick(course.id)}
                  text="Manage"
                  className="px-3 py-1 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                />
              </div>
            </li>
          ))}
        </ul>
      </main>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
          <div className="bg-white border-3 px-6 py-3 rounded-lg shadow-lg w-115 h-90 text-center">
            <h3 className="text-xl font-bold mb-4">Manage Course</h3>
            <p className="mb-4">What do you want to manage?</p>
            <div className="flex flex-col gap-4">
              {/* First Row - Two Buttons */}
              <div className="flex justify-center gap-4">
                <Link href={`/teacher/manage-student?id=${selectedCourseId}`}>
                  <Button
                    text="Manage Course's Students"
                    className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                  />
                </Link>

                <Link
                  href={`/teacher/manage-assistance?id=${selectedCourseId}`}
                >
                  <Button
                    text="Manage Teaching Assistants"
                    className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                  />
                </Link>
              </div>

              {/* Second Row - Single Button */}
              <div className="flex justify-center gap-4">
                <Link href={`/teacher/manage-material?id=${selectedCourseId}`}>
                  <Button
                    text="Manage Teaching Material"
                    className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                  />
                </Link>

                <Link
                  href={`/teacher/manage-assignment?id=${selectedCourseId}`}
                >
                  <Button
                    text="Manage Course's Assignments"
                    className="w-50 h-20 px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
                  />
                </Link>
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

export default ManageMainPage;

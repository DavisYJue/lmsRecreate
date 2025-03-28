"use client";
import React from "react";

const CourseCard = ({ course }) => (
  <div
    className="bg-white border-2 shadow-lg rounded-lg p-6 transition transform hover:scale-105 hover:shadow-2xl"
    style={{ width: "298px", flexGrow: 0 }} // Set a fixed width
  >
    <img
      src={course.imageUrl}
      alt={course.title}
      className="h-40 w-full object-cover rounded mb-4"
    />
    <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
      {course.title}
    </h3>
    <p className="text-sm text-gray-600 mb-4">{course.dateRange}</p>
    <button className="delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100 border-2 text-slate-950 border-slate-900 w-full px-4 py-2 bg-blue-300 font-bold p-3 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400 rounded-md">
      View Course
    </button>
  </div>
);

export default CourseCard;

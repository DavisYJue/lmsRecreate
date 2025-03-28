"use client";
import React from "react";
import CourseCard from "./CourseCard";

const CourseList = ({ courses }) => (
  <div className="flex flex-wrap gap-8 justify-start">
    {courses.map((course) => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
);

export default CourseList;

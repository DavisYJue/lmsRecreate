"use client";
import React from "react";

const Filter = ({ filter, onChange }) => (
  <select
    onChange={onChange}
    value={filter}
    className="p-2 border-2 rounded-md bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 mb-6 w-48"
  >
    <option value="all">All Courses</option>
    <option value="ongoing">Ongoing Courses</option>
    <option value="completed">Completed Courses</option>
    <option value="outdated">Outdated Courses</option>
  </select>
);

export default Filter;

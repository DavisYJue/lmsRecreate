"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ConfirmationPopup from "../components/ConfirmationPopup";
import DataTable from "../components/DataTable";
import SearchInput from "../components/SearchInput";

const ManageStudents = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search for student table
  const [popupSearchQuery, setPopupSearchQuery] = useState(""); // Search for add student popup
  const [confirmStudent, setConfirmStudent] = useState(null); // Store student before confirmation
  const [availableStudents, setAvailableStudents] = useState([
    { id: 3, name: "Alice Johnson", studentId: "S103", class: "Math 101" },
    { id: 4, name: "Bob Brown", studentId: "S104", class: "Physics 101" },
  ]);

  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        // Simulated student and assignment data (Replace with API call)
        const studentsData = [
          {
            id: 1,
            name: "John Doe",
            studentId: "S101",
            email: "john@example.com",
            class: "Math 101",
          },
          {
            id: 2,
            name: "Jane Smith",
            studentId: "S102",
            email: "jane@example.com",
            class: "Physics 101",
          },
        ];

        const assignmentsData = [
          {
            id: 101,
            title: "Assignment 1",
            submissions: [
              { studentId: 1, status: "Submitted" },
              { studentId: 2, status: "Not Submitted" },
            ],
          },
          {
            id: 102,
            title: "Assignment 2",
            submissions: [
              { studentId: 1, status: "Graded" },
              { studentId: 2, status: "Submitted" },
            ],
          },
        ];

        setStudents(studentsData);
        setAssignments(assignmentsData);
      };

      fetchCourseData();
    }
  }, [courseId]);

  const confirmAddStudent = (student) => {
    setConfirmStudent(student); // Set student before confirming
  };

  const addStudent = () => {
    if (confirmStudent) {
      setStudents([...students, confirmStudent]);
      setAvailableStudents(
        availableStudents.filter((s) => s.id !== confirmStudent.id)
      );
      setConfirmStudent(null); // Reset confirmation state
      setIsPopupOpen(false);
    }
  };

  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState(null);

  const confirmRemove = (student) => {
    setConfirmRemoveStudent(student);
  };

  const removeStudentConfirmed = () => {
    if (confirmRemoveStudent) {
      setStudents(
        students.filter((student) => student.id !== confirmRemoveStudent.id)
      );
      setConfirmRemoveStudent(null); // Reset confirmation state
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Manage Course's Students" />

      <main className="max-w-4xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Students</h2>

        {/* Page Search Bar */}
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students by name, ID, or class"
        />

        <Button
          text="Add Student"
          onClick={() => setIsPopupOpen(true)}
          className="mb-4 px-4 py-2 text-slate-950 bg-blue-300 rounded-lg hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
        />

        {/* Student Table */}
        <DataTable
          data={students}
          searchQuery={searchQuery}
          onRemove={confirmRemove}
          entityType="Student"
        />

        {/* Add Student Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
            <div className="bg-white border-3 p-6 rounded-md shadow-lg w-96">
              <h3 className="text-xl font-bold mb-4">Add Student</h3>

              <SearchInput
                value={popupSearchQuery}
                onChange={(e) => setPopupSearchQuery(e.target.value)}
                placeholder="Search by name, student ID, or class"
              />

              <ul className="max-h-40 overflow-auto border rounded-md">
                {availableStudents
                  .filter(
                    (student) =>
                      student.name
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase()) ||
                      student.studentId
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase()) ||
                      student.class
                        .toLowerCase()
                        .includes(popupSearchQuery.toLowerCase())
                  )
                  .map((student) => (
                    <li
                      key={student.id}
                      className="p-2 border-b flex justify-between items-center"
                    >
                      <span>
                        {student.name} ({student.studentId}) - {student.class}
                      </span>
                      <Button
                        text="Add"
                        onClick={() => confirmAddStudent(student)}
                        className="px-3 py-1 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                      />
                    </li>
                  ))}
              </ul>

              <div className="flex justify-center">
                <Button
                  text="Close"
                  onClick={() => setIsPopupOpen(false)}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Popup */}
        {confirmStudent && (
          <ConfirmationPopup
            title="Confirm Add Student"
            message={`Are you sure you want to add ${confirmStudent.name} (${confirmStudent.studentId}) from ${confirmStudent.class}?`}
            onConfirm={addStudent}
            onCancel={() => setConfirmStudent(null)}
          />
        )}

        {confirmRemoveStudent && (
          <ConfirmationPopup
            title="Confirm Remove Student"
            message={`Are you sure you want to remove ${confirmRemoveStudent.name} (${confirmRemoveStudent.studentId}) from ${confirmRemoveStudent.class}?`}
            onConfirm={removeStudentConfirmed}
            onCancel={() => setConfirmRemoveStudent(null)}
          />
        )}
      </main>

      <div className="flex justify-center">
        <Button
          text="Back"
          onClick={() => router.push("/manageMainPage")}
          className="w-25 mb-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ManageStudents;

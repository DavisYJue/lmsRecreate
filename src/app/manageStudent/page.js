"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import ConfirmationPopup from "../components/ConfirmationPopup";
import DataTable from "../components/DataTable";
import SearchInput from "../components/SearchInput";

const ManageStudents = () => {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupSearchQuery, setPopupSearchQuery] = useState("");
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState(null);

  // Fetch enrolled students
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch("/api/courses/getStudentData", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch student data");
        const data = await res.json();
        setStudents(data.students);
      } catch (error) {
        console.error("Error fetching student data:", error);
        alert("Failed to load student data. Please try again.");
      }
    };
    fetchStudentData();
  }, []);

  // Fetch available students for popup
  const fetchAvailableStudents = async () => {
    try {
      const res = await fetch("/api/courses/notEnrolled", {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch students");
      }
      const data = await res.json();
      setAvailableStudents(data);
    } catch (error) {
      console.error("Error fetching available students:", error);
      alert(error.message);
    }
  };

  const openPopup = () => {
    fetchAvailableStudents();
    setIsPopupOpen(true);
  };

  const confirmAddStudent = (student) => {
    setConfirmStudent(student);
  };

  const addStudent = async () => {
    if (!confirmStudent) return;

    try {
      const res = await fetch("/api/courses/enrollStudent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: confirmStudent.student_id,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to enroll student");
      }

      setStudents([...students, confirmStudent]);
      setAvailableStudents(
        availableStudents.filter(
          (s) => s.student_id !== confirmStudent.student_id
        )
      );

      // Add success alert
      alert(
        `${confirmStudent.student_name} has been successfully added to the course!`
      );
    } catch (error) {
      console.error("Error adding student:", error);
      alert(error.message);
    } finally {
      setConfirmStudent(null);
      setIsPopupOpen(false);
    }
  };

  const confirmRemove = (student) => {
    setConfirmRemoveStudent(student);
  };

  const removeStudentConfirmed = async () => {
    if (!confirmRemoveStudent) return;

    try {
      const res = await fetch("/api/courses/removeStudent", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: confirmRemoveStudent.student_id,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to remove student");
      }

      setStudents(
        students.filter(
          (student) => student.student_id !== confirmRemoveStudent.student_id
        )
      );

      // Add success alert
      alert(
        `${confirmRemoveStudent.student_name} has been successfully removed from the course!`
      );
    } catch (error) {
      console.error("Error removing student:", error);
      alert(error.message);
    } finally {
      setConfirmRemoveStudent(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#a9c3d2] to-[#fcf4e7]">
      <Header title="Manage Course's Students" />

      <main className="max-w-4xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Students</h2>

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students by name, ID, or class"
        />

        <Button
          text="Add Student"
          onClick={openPopup}
          className="mb-4 px-4 py-2 text-slate-950 bg-blue-300 rounded-lg hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
        />

        <DataTable
          data={students}
          searchQuery={searchQuery}
          onRemove={confirmRemove}
          entityType="Student"
        />

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
                  .filter((student) =>
                    `${student.student_name} ${student.student_id} ${student.class}`
                      .toLowerCase()
                      .includes(popupSearchQuery.toLowerCase())
                  )
                  .map((student) => (
                    <li
                      key={student.student_id}
                      className="p-2 border-b flex justify-between items-center"
                    >
                      <span>
                        {student.student_name} ({student.student_id}) -{" "}
                        {student.class}
                      </span>
                      <Button
                        text="Add"
                        onClick={() => confirmAddStudent(student)}
                        className="px-3 py-1 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                      />
                    </li>
                  ))}
              </ul>

              <div className="flex justify-center mt-4">
                <Button
                  text="Close"
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 transition"
                />
              </div>
            </div>
          </div>
        )}

        {confirmStudent && (
          <ConfirmationPopup
            title="Confirm Add Student"
            message={`Add ${confirmStudent.student_name} (${confirmStudent.student_id}) from ${confirmStudent.class}?`}
            onConfirm={addStudent}
            onCancel={() => setConfirmStudent(null)}
          />
        )}

        {confirmRemoveStudent && (
          <ConfirmationPopup
            title="Confirm Remove Student"
            message={`Remove ${confirmRemoveStudent.student_name} (${confirmRemoveStudent.student_id})?`}
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

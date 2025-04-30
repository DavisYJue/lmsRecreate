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
  const [teachers, setTeachers] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupSearchQuery, setPopupSearchQuery] = useState("");
  const [confirmStudent, setConfirmStudent] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState(null);
  const [currentRole, setCurrentRole] = useState("Student");

  // Fetch all enrolled entities
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studentRes = await fetch("/api/courses/getStudentData", {
          credentials: "include",
        });
        if (!studentRes.ok) throw new Error("Failed to fetch student data");
        const studentData = await studentRes.json();
        setStudents(studentData.students);

        // Fetch teachers
        const teacherRes = await fetch("/api/courses/getTeacherData", {
          credentials: "include",
        });
        if (teacherRes.ok) {
          const teacherData = await teacherRes.json();
          setTeachers(teacherData.teachers);
        }

        // Fetch assistants
        const assistantRes = await fetch("/api/courses/getAssistantData", {
          credentials: "include",
        });
        if (assistantRes.ok) {
          const assistantData = await assistantRes.json();
          setAssistants(assistantData.assistants);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please try again.");
      }
    };
    fetchData();
  }, []);

  // Fetch available entities for popup
  const fetchAvailableEntities = async (role) => {
    try {
      let endpoint = "";
      switch (role) {
        case "Student":
          endpoint = "/api/courses/notEnrolledStudents";
          break;
        case "Teacher":
          endpoint = "/api/courses/notEnrolledTeachers";
          break;
        case "Assistant":
          endpoint = "/api/courses/notEnrolledAssistants";
          break;
        default:
          return;
      }

      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      switch (role) {
        case "Student":
          setAvailableStudents(data);
          break;
        case "Teacher":
          setAvailableTeachers(data);
          break;
        case "Assistant":
          setAvailableAssistants(data);
          break;
      }
    } catch (error) {
      console.error(`Error fetching available ${role}s:`, error);
      alert(error.message);
    }
  };

  const openPopup = (role) => {
    setCurrentRole(role);
    fetchAvailableEntities(role);
    setIsPopupOpen(true);
  };

  const confirmAddEntity = (entity) => {
    setConfirmStudent(entity);
  };

  const addEntity = async () => {
    if (!confirmStudent) return;

    try {
      let endpoint = "";
      switch (currentRole) {
        case "Student":
          endpoint = "/api/courses/enrollStudent";
          break;
        case "Teacher":
          endpoint = "/api/courses/enrollTeacher";
          break;
        case "Assistant":
          endpoint = "/api/courses/enrollAssistant";
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: confirmStudent.account_id,
          [currentRole.toLowerCase() + "_id"]:
            confirmStudent[currentRole.toLowerCase() + "_id"],
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      // Update UI state
      switch (currentRole) {
        case "Student":
          setStudents([...students, confirmStudent]);
          setAvailableStudents(
            availableStudents.filter(
              (s) => s.student_id !== confirmStudent.student_id
            )
          );
          break;
        case "Teacher":
          setTeachers([...teachers, confirmStudent]);
          setAvailableTeachers(
            availableTeachers.filter(
              (t) => t.teacher_id !== confirmStudent.teacher_id
            )
          );
          break;
        case "Assistant":
          setAssistants([...assistants, confirmStudent]);
          setAvailableAssistants(
            availableAssistants.filter(
              (a) => a.assistant_id !== confirmStudent.assistant_id
            )
          );
          break;
      }

      alert(
        `${
          confirmStudent[currentRole.toLowerCase() + "_name"]
        } added successfully!`
      );
    } catch (error) {
      console.error("Error adding entity:", error);
      alert(error.message);
    } finally {
      setConfirmStudent(null);
      setIsPopupOpen(false);
    }
  };

  const removeEntity = async (entity, role) => {
    try {
      const res = await fetch("/api/courses/removeEnrollment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: entity.account_id,
          role: role,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      // Update UI state
      switch (role) {
        case "Student":
          setStudents(
            students.filter((s) => s.student_id !== entity.student_id)
          );
          break;
        case "Teacher":
          setTeachers(
            teachers.filter((t) => t.teacher_id !== entity.teacher_id)
          );
          break;
        case "Assistant":
          setAssistants(
            assistants.filter((a) => a.assistant_id !== entity.assistant_id)
          );
          break;
      }

      alert(`${entity[role.toLowerCase() + "_name"]} removed successfully!`);
    } catch (error) {
      console.error("Error removing entity:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#a9c3d2] to-[#fcf4e7]">
      <Header title="Manage Course Participants" />

      <main className="max-w-4xl w-full mx-auto mt-6 mb-6 p-6 bg-white shadow-lg rounded-lg flex-1">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Participants</h2>

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search participants by name, ID, or department"
        />

        <div className="flex gap-4 mb-4">
          <Button
            text="Add Student"
            onClick={() => openPopup("Student")}
            className="px-4 py-2 text-slate-950 bg-blue-300 rounded-lg hover:bg-indigo-400 transition"
          />
          <Button
            text="Add Teacher"
            onClick={() => openPopup("Teacher")}
            className="px-4 py-2 text-slate-950 bg-purple-300 rounded-lg hover:bg-purple-400 transition"
          />
          <Button
            text="Add Assistant"
            onClick={() => openPopup("Assistant")}
            className="px-4 py-2 text-slate-950 bg-green-300 rounded-lg hover:bg-green-400 transition"
          />
        </div>

        {/* Student Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Students</h3>
          <DataTable
            data={students}
            searchQuery={searchQuery}
            onRemove={(item) => removeEntity(item, "Student")}
            entityType="Student"
          />
        </div>

        {/* Teacher Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Class Teachers</h3>
          <DataTable
            data={teachers}
            searchQuery={searchQuery}
            onRemove={(item) => removeEntity(item, "Teacher")}
            entityType="Teacher"
          />
        </div>

        {/* Assistant Table */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Teaching Assistants</h3>
          <DataTable
            data={assistants}
            searchQuery={searchQuery}
            onRemove={(item) => removeEntity(item, "Assistant")}
            entityType="Assistant"
          />
        </div>

        {/* Add Entity Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96 flex flex-col justify-center items-center">
              <h3 className="text-xl font-bold mb-4">Add {currentRole}</h3>

              <div className="flex gap-2 mb-4">
                {["Student", "Teacher", "Assistant"].map((role) => (
                  <Button
                    key={role}
                    text={role}
                    onClick={() => {
                      setCurrentRole(role);
                      fetchAvailableEntities(role);
                    }}
                    className={`px-3 py-1 ${
                      currentRole === role
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <SearchInput
                value={popupSearchQuery}
                onChange={(e) => setPopupSearchQuery(e.target.value)}
                placeholder={`Search ${currentRole.toLowerCase()}s...`}
              />

              <ul className="max-h-60 overflow-auto border rounded-md mt-4 w-full">
                {(currentRole === "Student"
                  ? availableStudents
                  : currentRole === "Teacher"
                  ? availableTeachers
                  : availableAssistants
                )
                  .filter((entity) => {
                    const searchString = `${
                      entity[currentRole.toLowerCase() + "_name"]
                    } ${
                      currentRole === "Student"
                        ? entity.student_id
                        : currentRole === "Teacher"
                        ? entity.teacher_id
                        : entity.assistant_id
                    } ${
                      currentRole === "Student"
                        ? entity.class
                        : currentRole === "Teacher"
                        ? entity.faculty
                        : entity.department
                    }`.toLowerCase();

                    return searchString.includes(
                      popupSearchQuery.toLowerCase()
                    );
                  })
                  .map((entity) => (
                    <li
                      key={entity[currentRole.toLowerCase() + "_id"]}
                      className="p-2 border-b flex justify-between items-center"
                    >
                      <span>
                        {entity[currentRole.toLowerCase() + "_name"]} (
                        {currentRole === "Student" ? (
                          <>
                            S-ID: {entity.student_id}, Class: {entity.class}
                          </>
                        ) : currentRole === "Teacher" ? (
                          <>
                            A-ID: {entity.account_id}, Faculty: {entity.faculty}
                          </>
                        ) : (
                          <>
                            A-ID: {entity.account_id}, Department:{" "}
                            {entity.department}
                          </>
                        )}
                        )
                      </span>
                      <Button
                        text="Add"
                        onClick={() => confirmAddEntity(entity)}
                        className="px-3 py-1 bg-emerald-200 hover:bg-green-400"
                      />
                    </li>
                  ))}
              </ul>

              <Button
                text="Close"
                onClick={() => setIsPopupOpen(false)}
                className="flex mt-4 w-1/5 h-10 bg-gray-500 hover:bg-gray-600 text-white justify-center items-center"
              />
            </div>
          </div>
        )}

        {/* Confirmation Popups */}
        {confirmStudent && (
          <ConfirmationPopup
            title={`Confirm Add ${currentRole}`}
            message={`Add ${
              confirmStudent[currentRole.toLowerCase() + "_name"]
            }?`}
            onConfirm={addEntity}
            onCancel={() => setConfirmStudent(null)}
          />
        )}
      </main>

      <div className="flex justify-center">
        <Button
          text="Back"
          onClick={() => router.push("/manageMainPage")}
          className="mb-4 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ManageStudents;

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const EditAssignment = () => {
  const router = useRouter();

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await fetch("/api/courses/editAssignment");
        if (res.ok) {
          const data = await res.json();
          setAssignmentTitle(data.assignment_title);
          setAssignmentDescription(data.assignment_description);
          setDueDate(data.due_date?.split("T")[0] || "");
          setExistingFiles(data.files || []);
        } else {
          console.error("Failed to fetch assignment details");
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    fetchAssignment();
  }, []);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    // Replace previous files instead of appending
    setFiles(uploadedFiles);
  };

  const handleSubmit = async () => {
    if (!assignmentTitle || !assignmentDescription || !dueDate) return;

    const formData = new FormData();
    formData.append("assignment_title", assignmentTitle);
    formData.append("assignment_description", assignmentDescription);
    formData.append("due_date", dueDate);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/courses/updateAssignment", {
        method: "POST",
        body: formData,
      });

      // Handle response safely
      const responseText = await res.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("Failed to parse response:", e);
      }

      if (res.ok) {
        alert("Assignment updated successfully!");
        router.push("/manageAssignment");
      } else {
        alert(`Update failed: ${result.error || "Unknown error"}`);
        // Clear files on error
        setFiles([]);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to connect to server");
      setFiles([]);
    }
  };

  const isFormValid = assignmentTitle && assignmentDescription && dueDate;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Edit Assignment" />

      <main className="flex-grow max-w-3xl w-full mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg min-w-[300px]">
        <h2 className="text-2xl font-bold text-center text-slate-900">
          Edit Assignment
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold">
              Assignment Title
            </label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="Enter Assignment Title"
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">
              Assignment Description
            </label>
            <textarea
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              placeholder="Enter Assignment Description"
              className="w-full min-h-65 p-2 border border-gray-300 rounded-md mt-2"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-semibold">
              Assignment Materials
            </label>

            {existingFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-700 font-semibold">
                  Existing Files (will be replaced):
                </p>
                <ul className="list-disc pl-5">
                  {existingFiles.map((file, index) => (
                    <li key={`existing-${index}`} className="text-gray-700">
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-700 font-semibold">
                  New Files (replacing previous selection):
                </p>
                <ul className="list-disc pl-5">
                  {files.map((file, index) => (
                    <li key={`new-${index}`} className="text-gray-700">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-300 rounded-md mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Selecting new files will replace previous selection
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSubmit}
              text="Update Assignment"
              className="px-4 py-2 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
              disabled={!isFormValid}
            />
          </div>
        </div>
      </main>

      <div className="mt-auto p-4 flex justify-center w-full">
        <Button
          onClick={() => router.push("/manageAssignment")}
          text="Back to Course"
          className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      <Footer />
    </div>
  );
};

export default EditAssignment;

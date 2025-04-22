"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const CourseDetails = () => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedFiles, setSubmittedFiles] = useState({});
  const [showMaterial, setShowMaterial] = useState(null);
  const [allowSubmit, setAllowSubmit] = useState({});
  const [courseData, setCourseData] = useState(null); // default is null
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch("/api/courses/details", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch course details");

        const data = await response.json();
        console.log("Course data fetched:", data); // Debugging line
        setCourseData(data);
      } catch (error) {
        console.error("Error loading course data:", error);
      }
    };

    fetchCourseDetails();
  }, []);

  const handleFileUpload = async (assignmentTitle, files) => {
    // Store file paths and files
    const fileArray = Array.from(files);

    // Assuming you have a function that uploads the file to the server and returns the path
    const filePaths = await uploadFilesToServer(fileArray);

    // Save to uploadedFiles
    setUploadedFiles((prevFiles) => ({
      ...prevFiles,
      [assignmentTitle]: filePaths, // Save the file paths for the assignment
    }));
  };

  // Example of an API function that uploads files and returns file paths
  const uploadFilesToServer = async (files) => {
    // Create FormData to send to the server
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    const data = await response.json();
    return data.filePaths; // Assuming the response returns file paths
  };

  const handleSubmit = async (assignmentTitle) => {
    const files = uploadedFiles[assignmentTitle];

    if (files && files.length > 0) {
      // Create a submission object with the file paths
      const submissionData = {
        assignment_id: assignmentTitle, // Assuming assignmentTitle is the ID
        student_id: session.account_id, // Get student ID from session
        filePaths: files.map((file) => file.path), // File paths from the uploaded files
      };

      // Send to API to create the submission
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        alert("Failed to submit");
      } else {
        // Mark as submitted in UI
        setSubmittedFiles((prevFiles) => ({
          ...prevFiles,
          [assignmentTitle]: {
            files: files,
            submitTime: new Date(),
          },
        }));
      }
    }
  };

  const handleUnsubmit = async (assignmentTitle) => {
    const response = await fetch("/api/unsubmit", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assignment_id: assignmentTitle,
        student_id: session.account_id,
      }),
    });

    if (response.ok) {
      // Reset submission status in UI
      setSubmittedFiles((prevFiles) => {
        const updatedFiles = { ...prevFiles };
        delete updatedFiles[assignmentTitle];
        return updatedFiles;
      });
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Course Details" />

      <main className="flex-grow max-w-3xl w-full mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg min-w-[300px]">
        {courseData ? (
          <>
            <div className="flex justify-between items-center">
              <div className="text-center flex-grow">
                <h2 className="text-2xl font-bold text-slate-900">
                  {courseData.course.course_title}
                </h2>
                <p className="text-gray-700 mt-2">
                  {courseData.course.course_description}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Assignments
              </h3>
              <ul className="list-none mt-2 text-gray-700">
                {(courseData.assignments || []).map((assignment, index) => (
                  <li key={index} className="p-2 border-b">
                    <div className="flex justify-between items-center">
                      <span
                        className={
                          submittedFiles[assignment.assignment_title]
                            ? "text-green-600 font-bold"
                            : ""
                        }
                      >
                        {assignment.assignment_title}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            setShowMaterial(
                              showMaterial === assignment.assignment_title
                                ? null
                                : assignment.assignment_title
                            )
                          }
                          text={
                            showMaterial === assignment.assignment_title
                              ? "Hide Details"
                              : "View Details"
                          }
                          className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                        />
                      </div>
                    </div>
                    {showMaterial === assignment.assignment_title && (
                      <div className="mt-2 p-2 bg-gray-200 rounded-lg">
                        <p className="text-gray-700 font-semibold">
                          Description:
                        </p>
                        <p className="mb-2">
                          {assignment.assignment_description}
                        </p>
                        <p className="text-gray-700 font-semibold mb-1">
                          Attach your answer here:
                        </p>
                        <Button
                          onClick={handleFileClick}
                          text="Attach Files"
                          className="block w-30 h-9 text-sm flex items-center justify-center bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
                        />

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={(e) =>
                            handleFileUpload(
                              assignment.assignment_title,
                              e.target.files
                            )
                          }
                          className="hidden"
                          disabled={
                            !!submittedFiles[assignment.assignment_title]
                          }
                        />

                        {uploadedFiles[assignment.assignment_title] && (
                          <div className="text-gray-700 mt-2">
                            <strong>Attached Files:</strong>
                            <ul className="list-disc pl-5">
                              {Array.from(
                                uploadedFiles[assignment.assignment_title]
                              ).map((file, i) => (
                                <li key={i}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {allowSubmit[assignment.assignment_title] &&
                          uploadedFiles[assignment.assignment_title]?.length >
                            0 && (
                            <Button
                              onClick={() =>
                                handleSubmit(assignment.assignment_title)
                              }
                              text="Submit"
                              className="mt-2 px-3 py-1 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                            />
                          )}

                        {submittedFiles[assignment.assignment_title] && (
                          <div className="mt-2">
                            <p className="text-green-600">Submitted Files:</p>
                            <p className="text-sm text-gray-600">
                              Submitted at:{" "}
                              {submittedFiles[
                                assignment.assignment_title
                              ].submitTime.toLocaleString()}
                            </p>
                            <ul>
                              {submittedFiles[
                                assignment.assignment_title
                              ].files.map((file, i) => (
                                <li key={i}>
                                  <a
                                    href={URL.createObjectURL(file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                  >
                                    {file.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-2 mt-2">
                              <Button
                                onClick={() =>
                                  handleUnsubmit(assignment.assignment_title)
                                }
                                text="Unsubmit"
                                className="px-3 py-1 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                              />
                            </div>
                          </div>
                        )}

                        {/* Displaying Assignment Attachments */}
                        {(assignment.materials || []).length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-lg font-semibold">
                              Assignment Attachments:
                            </h4>
                            <ul>
                              {assignment.materials.map((material, idx) => (
                                <li key={idx}>
                                  <a
                                    href={material.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                  >
                                    {material.file_path.split("/").pop()}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-900">
                Teacher Materials
              </h3>
              <ul className="list-none mt-2 text-gray-700">
                {(courseData.materials || []).map((material, index) => (
                  <li key={index} className="p-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {material.material_title}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            window.open(material.material_file, "_blank")
                          }
                          text="Open Material"
                          className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">Loading course details...</p>
        )}
      </main>

      <div className="mt-auto p-4 flex justify-center w-full">
        <Button
          onClick={() => {
            const role = courseData?.role || "student"; // assuming role comes from courseData
            router.push(
              role === "student" ? "/lmsMainPageStudent" : "/lmsMainPage"
            );
          }}
          text="Back"
          className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out"
        />
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;

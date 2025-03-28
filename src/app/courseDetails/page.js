"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const courseData = {
  title: "Cloud Computing 101",
  description: "An introduction to cloud computing and cloud architectures.",
  assignments: [
    {
      title: "Assignment 1: Introduction",
      description: "Introduction to Cloud Computing.",
      teacherAttachments: [
        "/materials/assignment_material1.pdf",
        "/materials/assignment_material2.pdf",
      ],
    },
    {
      title: "Assignment 2: Research Topic",
      description: "Research on advanced cloud architectures.",
      teacherAttachments: [
        "/materials/assignment_material3.pdf",
        "/materials/assignment_material4.pdf",
      ],
    },
    {
      title: "Assignment 3: Final Report",
      description: "Final project report on cloud computing.",
      teacherAttachments: [
        "/materials/assignment_material5.pdf",
        "/materials/assignment_material6.pdf",
      ],
    },
  ],
  teacherAttachments: [
    {
      name: "Lecture 1: Introduction to Cloud Computing",
      link: "/materials/lecture1.pdf",
    },
    {
      name: "Lecture 2: Advanced Cloud Architectures",
      link: "/materials/lecture2.pdf",
    },
    {
      name: "Project Guidelines",
      link: "/materials/project_guidelines.pdf",
    },
  ],
};

const CourseDetails = () => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedFiles, setSubmittedFiles] = useState({});
  const [showMaterial, setShowMaterial] = useState(null);
  const [allowSubmit, setAllowSubmit] = useState({});
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (assignment, files) => {
    setUploadedFiles((prevFiles) => ({
      ...prevFiles,
      [assignment]: files,
    }));
    setAllowSubmit((prevState) => ({
      ...prevState,
      [assignment]: true,
    }));
  };

  const handleSubmit = (assignment) => {
    if (uploadedFiles[assignment]?.length > 0) {
      setSubmittedFiles((prevFiles) => ({
        ...prevFiles,
        [assignment]: {
          files: Array.from(uploadedFiles[assignment]),
          submitTime: new Date(),
        },
      }));
      setAllowSubmit((prevState) => ({
        ...prevState,
        [assignment]: false,
      }));
    }
  };

  const handleUnsubmit = (assignment) => {
    setSubmittedFiles((prevFiles) => {
      const newSubmittedFiles = { ...prevFiles };
      delete newSubmittedFiles[assignment];
      return newSubmittedFiles;
    });
    setAllowSubmit((prevState) => ({
      ...prevState,
      [assignment]: true,
    }));
  };

  const handleFileClick = (assignment) => {
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
        <div className="flex justify-between items-center">
          <div className="text-center flex-grow">
            <h2 className="text-2xl font-bold text-slate-900">
              {courseData.title}
            </h2>
            <p className="text-gray-700 mt-2">{courseData.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-900">Assignments</h3>
          <ul className="list-none mt-2 text-gray-700">
            {courseData.assignments.map((assignment, index) => (
              <li key={index} className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <span
                    className={
                      submittedFiles[assignment.title]
                        ? "text-green-600 font-bold"
                        : ""
                    }
                  >
                    {assignment.title}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setShowMaterial(
                          showMaterial === assignment.title
                            ? null
                            : assignment.title
                        )
                      }
                      text={
                        showMaterial === assignment.title
                          ? "Hide Details"
                          : "View Details"
                      }
                      className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                    />
                  </div>
                </div>
                {showMaterial === assignment.title && (
                  <div className="mt-2 p-2 bg-gray-200 rounded-lg">
                    <p className="text-gray-700 font-semibold">Description:</p>
                    <p className="mb-2">{assignment.description}</p>
                    <p className="text-gray-700 font-semibold mb-1">
                      Attach your answer here:
                    </p>
                    <Button
                      onClick={() => handleFileClick(assignment.title)}
                      text="Attach Files"
                      className="block w-30 h-9 text-sm flex items-center justify-center bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleFileUpload(assignment.title, e.target.files)
                      }
                      className="hidden"
                      disabled={!!submittedFiles[assignment.title]}
                    />
                    {uploadedFiles[assignment.title] && (
                      <div className="text-gray-700 mt-2">
                        <strong>Attached Files:</strong>
                        <ul className="list-disc pl-5">
                          {Array.from(uploadedFiles[assignment.title]).map(
                            (file, index) => (
                              <li key={index}>{file.name}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    {allowSubmit[assignment.title] &&
                      uploadedFiles[assignment.title]?.length > 0 && (
                        <Button
                          onClick={() => handleSubmit(assignment.title)}
                          text="Submit"
                          className="mt-2 px-3 py-1 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                        />
                      )}
                    {submittedFiles[assignment.title] && (
                      <div className="mt-2">
                        <p className="text-green-600">Submitted Files:</p>
                        <p className="text-sm text-gray-600">
                          Submitted at:{" "}
                          {submittedFiles[
                            assignment.title
                          ].submitTime.toLocaleString()}
                        </p>
                        <ul>
                          {submittedFiles[assignment.title].files.map(
                            (file, index) => (
                              <li key={index}>
                                <a
                                  href={URL.createObjectURL(file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500"
                                >
                                  {file.name}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleUnsubmit(assignment.title)}
                            text="Unsubmit"
                            className="px-3 py-1 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                          />
                        </div>
                      </div>
                    )}
                    {showMaterial === assignment.title && (
                      <div className="mt-4">
                        <h4 className="text-lg font-semibold">
                          Teacher Attachments:
                        </h4>
                        <ul>
                          {assignment.teacherAttachments.map(
                            (material, idx) => (
                              <li key={idx}>
                                <a
                                  href={material}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500"
                                >
                                  {material.split("/").pop()}
                                </a>
                              </li>
                            )
                          )}
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
            {courseData.teacherAttachments.map((material, index) => (
              <li key={index} className="p-2 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{material.name}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {}}
                      text="Open Material"
                      className="px-3 py-1 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <div className="mt-auto p-4 flex justify-center w-full">
        <Button
          onClick={() => router.push("/lmsMainPage")}
          text="Back"
          className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;

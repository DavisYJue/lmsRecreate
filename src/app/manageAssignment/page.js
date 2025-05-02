"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const ManageAssignments = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState([
    {
      title: "Assignment 1: Introduction",
      submissions: [
        {
          student: "Alice Johnson",
          files: ["alice_intro.pdf", "alice_additional.pdf"],
          grade: "",
          confirmed: false,
          submissionTime: new Date("2024-05-01T14:30:00"),
        },
        {
          student: "Bob Smith",
          files: ["bob_intro.docx"],
          grade: "",
          confirmed: false,
          submissionTime: new Date("2024-05-02T09:15:00"),
        },
      ],
      notSubmitted: ["Eve Adams", "John Doe"],
    },
    {
      title: "Assignment 2: Research Topic",
      submissions: [
        {
          student: "Charlie Brown",
          files: ["charlie_research.pdf"],
          grade: "",
          confirmed: false,
          submissionTime: new Date("2024-05-03T16:45:00"),
        },
      ],
      notSubmitted: ["Sarah Connor", "Mike Ross"],
    },
    {
      title: "Assignment 3: Final Report",
      submissions: [],
      notSubmitted: ["David Miller", "Sophia Lee"],
    },
  ]);

  const handleGradeChange = (assignmentIndex, subIndex, grade) => {
    if (grade >= 0 && grade <= 100) {
      setAssignments((prevAssignments) => {
        const newAssignments = [...prevAssignments];
        newAssignments[assignmentIndex].submissions[subIndex].grade = grade;
        return newAssignments;
      });
    }
  };

  const confirmGrade = (assignmentIndex, subIndex) => {
    setAssignments((prevAssignments) => {
      const newAssignments = [...prevAssignments];
      if (newAssignments[assignmentIndex].submissions[subIndex].grade !== "") {
        newAssignments[assignmentIndex].submissions[subIndex].confirmed = true;
      }
      return newAssignments;
    });
  };

  const regrade = (assignmentIndex, subIndex) => {
    setAssignments((prevAssignments) => {
      const newAssignments = [...prevAssignments];
      newAssignments[assignmentIndex].submissions[subIndex].confirmed = false;
      return newAssignments;
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "linear-gradient(to bottom, #a9c3d2, #fcf4e7)",
      }}
    >
      <Header title="Manage Course Assignment" />

      <main className="flex-grow w-full max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-slate-900">
          Student Submissions
        </h2>

        <div className="flex flex-row justify-end gap-5">
          <div className="mt-6">
            <Button
              onClick={() => router.push("/editAssignment")}
              text="Edit Assignment"
              className="px-4 py-2 text-slate-950 bg-fuchsia-200 hover:bg-purple-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-fuchsia-900 active:text-white active:border-fuchsia-400"
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={() => router.push("/addAssignment")}
              text="Add Assignment"
              className="px-4 py-2 text-slate-950 bg-blue-300 hover:bg-indigo-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-indigo-950 active:text-white active:border-indigo-400"
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {assignments.map((assignment, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {assignment.title}
              </h3>
              {assignment.submissions.length > 0 ? (
                <ul className="space-y-3">
                  {assignment.submissions.map((submission, subIndex) => (
                    <li
                      key={subIndex}
                      className="flex flex-wrap items-center justify-between p-3 bg-white shadow rounded-lg"
                    >
                      <div className="w-1/4">
                        <p className="text-gray-700 font-medium">
                          {submission.student}
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {submission.submissionTime.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-1/4 text-center">
                        {submission.files.map((file, fileIndex) => (
                          <div key={fileIndex}>
                            <a
                              href={`/submissions/${file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {file}
                            </a>
                          </div>
                        ))}
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Grade"
                        value={submission.grade}
                        onChange={(e) =>
                          handleGradeChange(index, subIndex, e.target.value)
                        }
                        className="p-1 border border-gray-400 rounded w-1/6 text-center"
                        disabled={submission.confirmed}
                      />
                      {!submission.confirmed ? (
                        <Button
                          onClick={() => confirmGrade(index, subIndex)}
                          text="Confirm"
                          className="px-3 py-1 w-1/6 text-slate-950 bg-emerald-200 hover:bg-green-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-green-900 active:text-white active:border-green-400"
                          disabled={submission.grade === ""}
                        />
                      ) : (
                        <Button
                          onClick={() => regrade(index, subIndex)}
                          text="Re-grade"
                          className="px-3 py-1 w-1/6 text-slate-950 bg-red-300 hover:bg-rose-400 hover:border-slate-900 hover:text-slate-950 transition active:bg-pink-800 active:text-white active:border-rose-400"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No submissions yet.</p>
              )}
              {assignment.notSubmitted.length > 0 && (
                <div className="mt-3 text-gray-700">
                  <h4 className="font-semibold">Not Submitted:</h4>
                  <ul className="list-disc pl-5">
                    {assignment.notSubmitted.map((student, subIndex) => (
                      <li key={subIndex}>{student}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="mt-auto p-4 flex justify-center w-full">
        <Button
          onClick={() => router.push("/manageMainPage")}
          text="Back"
          className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 font-bold border-2 border-slate-900 active:bg-slate-900 active:border-stone-50 delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-100"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ManageAssignments;

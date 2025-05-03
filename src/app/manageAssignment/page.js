"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";

const ManageAssignments = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/courses/assignment");
        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();

        const parsedData = data.map((assignment) => ({
          // If your API already returns a `title`, use it; otherwise rename:
          title: assignment.title,

          // Turn each flat submission into the UI shape
          submissions: assignment.submissions.map((sub) => ({
            submissionId: sub.submission_id,
            student: sub.submitter, // rename
            files: sub.file_path
              ? Array.isArray(sub.file_path)
                ? sub.file_path
                : [sub.file_path]
              : [], // wrap single path
            grade: sub.grade ?? "", // default to empty string
            confirmed: false, // or derive from your data
            submissionTime: new Date(sub.submission_time),
          })),

          // If your API doesn’t return notSubmitted, at least give an empty array
          notSubmitted: assignment.notSubmitted || [],
        }));

        setAssignments(parsedData);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    fetchAssignments();
  }, []);

  const handleGradeChange = (assignmentIndex, subIndex, grade) => {
    if (grade >= 0 && grade <= 100) {
      setAssignments((prev) => {
        const updated = [...prev];
        updated[assignmentIndex].submissions[subIndex].grade = grade;
        return updated;
      });
    }
  };

  const confirmGrade = (assignmentIndex, subIndex) => {
    setAssignments((prev) => {
      const updated = [...prev];
      if (updated[assignmentIndex].submissions[subIndex].grade !== "") {
        updated[assignmentIndex].submissions[subIndex].confirmed = true;
      }
      return updated;
    });
  };

  const regrade = (assignmentIndex, subIndex) => {
    setAssignments((prev) => {
      const updated = [...prev];
      updated[assignmentIndex].submissions[subIndex].confirmed = false;
      return updated;
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
                              href={`${file}`}
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

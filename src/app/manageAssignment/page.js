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
          title: assignment.title,
          submissions: assignment.submissions.map((sub) => ({
            submissionId: sub.submission_id,
            student: sub.submitter,
            // split comma-separated paths into array
            files: sub.file_path
              ? sub.file_path.split(",").map((p) => p.trim())
              : [],
            grade: sub.grade ?? "",
            confirmed: false,
            submissionTime: new Date(sub.submission_time),
          })),
          notSubmitted: assignment.notSubmitted || [],
        }));

        setAssignments(parsedData);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    fetchAssignments();
  }, []);

  const handleGradeChange = (ai, si, grade) => {
    if (grade >= 0 && grade <= 100) {
      setAssignments((prev) => {
        const next = [...prev];
        next[ai].submissions[si].grade = grade;
        return next;
      });
    }
  };

  const confirmGrade = (ai, si) => {
    setAssignments((prev) => {
      const next = [...prev];
      if (next[ai].submissions[si].grade !== "") {
        next[ai].submissions[si].confirmed = true;
      }
      return next;
    });
  };

  const regrade = (ai, si) => {
    setAssignments((prev) => {
      const next = [...prev];
      next[ai].submissions[si].confirmed = false;
      return next;
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

        <div className="flex justify-end gap-5 mt-6">
          <Button
            onClick={() => router.push("/editAssignment")}
            text="Edit Assignment"
            className="px-4 py-2 bg-fuchsia-200 hover:bg-purple-400 text-slate-950"
          />
          <Button
            onClick={() => router.push("/addAssignment")}
            text="Add Assignment"
            className="px-4 py-2 bg-blue-300 hover:bg-indigo-400 text-slate-950"
          />
        </div>

        <div className="mt-6 space-y-6">
          {assignments.map((assignment, ai) => (
            <div key={ai} className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-3">{assignment.title}</h3>

              {assignment.submissions.length > 0 ? (
                <ul className="space-y-3">
                  {assignment.submissions.map((sub, si) => (
                    <li
                      key={si}
                      className="flex flex-wrap items-center justify-between p-3 bg-white shadow rounded-lg"
                    >
                      <div className="w-1/4">
                        <p className="font-medium text-gray-700">
                          {sub.student}
                        </p>
                        <p className="text-sm text-gray-500">
                          Time: {sub.submissionTime.toLocaleString()}
                        </p>
                      </div>

                      <div className="w-1/4 text-center">
                        {sub.files.length > 0 ? (
                          sub.files.map((file, idx) => (
                            <div key={idx}>
                              <a
                                href={file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {file.split("/").pop()}
                              </a>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No files</p>
                        )}
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Grade"
                        value={sub.grade}
                        onChange={(e) =>
                          handleGradeChange(ai, si, e.target.value)
                        }
                        className="w-1/6 p-1 border rounded text-center"
                        disabled={sub.confirmed}
                      />

                      {!sub.confirmed ? (
                        <Button
                          onClick={() => confirmGrade(ai, si)}
                          text="Confirm"
                          className="px-3 py-1 bg-emerald-200 hover:bg-green-400 text-slate-950"
                          disabled={sub.grade === ""}
                        />
                      ) : (
                        <Button
                          onClick={() => regrade(ai, si)}
                          text="Re-grade"
                          className="px-3 py-1 bg-red-300 hover:bg-rose-400 text-slate-950"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No submissions yet.</p>
              )}

              {assignment.notSubmitted.length > 0 && (
                <div className="mt-3 text-gray-700">
                  <h4 className="font-semibold">Not Submitted:</h4>
                  <ul className="list-disc pl-5">
                    {assignment.notSubmitted.map((name, idx) => (
                      <li key={idx}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="mt-auto p-4 flex justify-center">
        <Button
          onClick={() => router.push("/manageMainPage")}
          text="Back"
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ManageAssignments;

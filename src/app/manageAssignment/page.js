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

        // inside your useEffect parser
        const parsedData = data.map((a) => ({
          assignmentId: a.assignment_id,
          title: a.title,
          dueDate: new Date(a.due_date), // 👈 Add this line
          submissions: a.submissions.map((s) => ({
            submissionId: s.submission_id,
            student: s.submitter,
            files: s.file_path
              ? s.file_path.split(",").map((p) => p.trim())
              : [],
            grade: s.grade ?? "",
            confirmed: s.confirmed,
            submissionTime: new Date(s.submission_time),
            role: s.role,
          })),
          notSubmitted: a.notSubmitted,
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

  const handleEditInfo = async (assignmentId) => {
    // Set cookie via API call (cannot set cookie from client using `next/headers`)
    await fetch("/api/courses/setAssignmentId", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId }),
    });

    router.push("/editAssignment");
  };

  const confirmGrade = async (ai, si) => {
    const updatedSubmission = assignments[ai].submissions[si];
    if (updatedSubmission.grade === "") return;

    setAssignments((prev) => {
      const next = [...prev];
      next[ai].submissions[si].confirmed = true; // Update confirmed flag locally
      return next;
    });

    try {
      const res = await fetch("/api/courses/assignment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: updatedSubmission.submissionId,
          new_grade: updatedSubmission.grade,
          role: updatedSubmission.role, // "student" or "other"
          confirmed: true, // Send the confirmed status to the backend
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm grade");

      console.log("Grade confirmed", data);
    } catch (err) {
      console.error("Error confirming grade:", err);
    }
  };

  const regrade = async (ai, si) => {
    const updatedSubmission = assignments[ai].submissions[si];
    // Set the grade to null (or an empty string) for regrade
    setAssignments((prev) => {
      const next = [...prev];
      next[ai].submissions[si].grade = ""; // Reset to empty string
      next[ai].submissions[si].confirmed = false; // Reset confirmed flag
      return next;
    });

    try {
      const res = await fetch("/api/courses/assignment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: updatedSubmission.submissionId,
          new_grade: "", // Set the grade to empty (or null, depending on preference)
          role: updatedSubmission.role, // "student" or "other"
          confirmed: false, // Reset the confirmed status
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to regrade submission");

      console.log("Regrade successful", data);
    } catch (err) {
      console.error("Error regrading:", err);
    }
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
                      className="flex flex-wrap items-center justify-between p-3 shadow rounded-lg bg-gray-100"
                    >
                      <div className="w-1/4">
                        <p className="font-medium text-gray-700">
                          {sub.student}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            sub.submissionTime > assignment.dueDate
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          Date: {sub.submissionTime.toLocaleDateString()} (
                          {sub.submissionTime > assignment.dueDate
                            ? "Late"
                            : "On-time"}
                          )
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

              <Button
                onClick={() => handleEditInfo(assignment.assignmentId)}
                text="Edit Course "
                className="px-3 py-1 mt-4 bg-yellow-200 hover:bg-yellow-300 text-slate-950 self-start"
              />
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

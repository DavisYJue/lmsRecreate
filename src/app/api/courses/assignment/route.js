import { cookies } from "next/headers";
import { query } from "../../../../../lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;
    if (!courseId) {
      return Response.json(
        { error: "Course ID not found in cookies." },
        { status: 400 }
      );
    }

    const assignments = await query(
      `SELECT assignment_id, assignment_title, max_grade
         FROM assignment
         WHERE course_id = ?`,
      [courseId]
    );

    const data = await Promise.all(
      assignments.map(async (a) => {
        const studentSubs = await query(
          `SELECT
             s.submission_id,
             acc.username       AS submitter,
             s.file_path,
             s.grade,
             s.grade IS NOT NULL AS confirmed,
             s.submission_time,
             s.graded_by,
             'student'          AS role
           FROM submission s
           JOIN student st ON s.student_id = st.student_id
           JOIN account acc ON st.account_id = acc.account_id
           WHERE s.assignment_id = ?`,
          [a.assignment_id]
        );
        const otherSubs = await query(
          `SELECT
             s.submission_id,
             acc.username       AS submitter,
             s.file_path,
             NULL               AS grade,
             FALSE              AS confirmed,
             s.submission_time,
             NULL               AS graded_by,
             'other'            AS role
           FROM othersubmission s
           JOIN account acc ON s.account_id = acc.account_id
           WHERE s.assignment_id = ?`,
          [a.assignment_id]
        );

        return {
          assignment_id: a.assignment_id,
          title: a.assignment_title,
          max_grade: a.max_grade,
          submissions: [...studentSubs, ...otherSubs].map((s) => ({
            submission_id: s.submission_id,
            submitter: s.submitter,
            file_path: s.file_path,
            grade: s.grade,
            confirmed: !!s.confirmed,
            submission_time: s.submission_time,
            graded_by: s.graded_by,
            role: s.role,
          })),
          notSubmitted: [], // or fetch it similarly
        };
      })
    );

    return Response.json(data);
  } catch (err) {
    console.error("GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// src/app/api/courses/assignment/route.js
export async function PUT(req) {
  try {
    const { submission_id, new_grade, role } = await req.json();
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const graderId = session ? JSON.parse(session).account_id : null;

    if (!submission_id || role !== "student" || graderId == null) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // fetch old grade
    const [existing] = await query(
      `SELECT grade FROM submission WHERE submission_id = ?`,
      [submission_id]
    );
    if (!existing) {
      return Response.json({ error: "Submission not found." }, { status: 404 });
    }
    const old_grade = existing.grade;

    // decide gradeToSet: null if new_grade is null or empty
    const gradeToSet = new_grade == null || new_grade === "" ? null : new_grade;

    // update submission
    await query(
      `UPDATE submission
           SET grade = ?, graded_by = ?
         WHERE submission_id = ?`,
      [gradeToSet, graderId, submission_id]
    );

    // audit log
    await query(
      `INSERT INTO grade_audit
           (submission_id, old_grade, new_grade, changed_by, change_date)
         VALUES (?, ?, ?, ?, NOW())`,
      [submission_id, old_grade, gradeToSet, graderId]
    );

    return Response.json({ message: "Updated" });
  } catch (err) {
    console.error("PUT error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

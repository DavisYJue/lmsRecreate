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

    // Get assignments for the course
    const assignments = await query(
      `SELECT assignment_id, assignment_title, max_grade FROM assignment WHERE course_id = ?`,
      [courseId]
    );

    const data = await Promise.all(
      assignments.map(async (assignment) => {
        const studentSubmissions = await query(
          `SELECT 
          s.submission_id,
          acc.username AS submitter,
          s.file_path,
          s.grade,
          s.submission_time,
          s.graded_by,
          'student' AS role
        FROM submission s
        JOIN student st ON s.student_id = st.student_id
        JOIN account acc ON st.account_id = acc.account_id
        WHERE s.assignment_id = ?`,
          [assignment.assignment_id]
        );

        const otherSubmissions = await query(
          `SELECT 
          s.submission_id,
          acc.username AS submitter,
          s.file_path,
          s.submission_time,
          s.grade,
          s.graded_by,
          'other' AS role
        FROM othersubmission s
        JOIN account acc ON s.account_id = acc.account_id
        WHERE s.assignment_id = ?`,
          [assignment.assignment_id]
        );

        const allSubmissions = [...studentSubmissions, ...otherSubmissions];

        return {
          assignment_id: assignment.assignment_id,
          title: assignment.assignment_title,
          max_grade: assignment.max_grade,
          submissions: allSubmissions.map((s) => ({
            submission_id: s.submission_id,
            submitter: s.submitter,
            file_path: s.file_path,
            submission_time: s.submission_time,
            grade: s.grade,
            graded_by: s.graded_by,
            role: s.role,
          })),
        };
      })
    );

    return Response.json(data);
  } catch (err) {
    console.error("GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { submission_id, new_grade, role } = body;

    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const changed_by = sessionCookie
      ? JSON.parse(sessionCookie).account_id
      : null;

    if (!submission_id || new_grade == null || !role || !changed_by) {
      return Response.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Determine correct table based on role
    const table = role === "student" ? "submission" : "othersubmission";

    // Fetch the old grade
    const [existing] = await query(
      `SELECT grade FROM ${table} WHERE submission_id = ?`,
      [submission_id]
    );

    if (!existing) {
      return Response.json({ error: "Submission not found." }, { status: 404 });
    }

    const old_grade = existing.grade;

    // Update the grade
    await query(
      `UPDATE ${table} SET grade = ?, graded_by = ? WHERE submission_id = ?`,
      [new_grade, changed_by, submission_id]
    );

    // Insert audit log
    await query(
      `INSERT INTO grade_audit (submission_id, old_grade, new_grade, changed_by, change_date)
         VALUES (?, ?, ?, ?, NOW())`,
      [submission_id, old_grade, new_grade, changed_by]
    );

    return Response.json({
      message: "Grade updated and audit logged successfully.",
    });
  } catch (err) {
    console.error("PUT error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

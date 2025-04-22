import { cookies } from "next/headers";
import { query } from "../../../../../lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      console.log("No session cookie found.");
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const courseId = session.selected_course_id;

    if (!courseId) {
      console.log("No course ID in session.");
      return Response.json({ error: "No course selected" }, { status: 400 });
    }

    console.log("Fetching course details for course ID:", courseId);

    const [course] = await query(`SELECT * FROM course WHERE course_id = ?`, [
      courseId,
    ]);

    if (!course) {
      console.log("No course found with the provided ID.");
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    const assignments = await query(
      `SELECT * FROM assignment WHERE course_id = ?`,
      [courseId]
    );

    const materials = await query(
      `SELECT * FROM material WHERE course_id = ?`,
      [courseId]
    );

    const [user] = await query(
      `SELECT account_id, username, email, telephone, address, bio, role
       FROM Account 
       WHERE account_id = ?`,
      [session.account_id]
    );

    for (const assignment of assignments) {
      // Assignment materials
      const files = await query(
        `SELECT * FROM assignment_material WHERE assignment_id = ?`,
        [assignment.assignment_id]
      );
      assignment.materials = files;

      // Submission (based on student_id)
      const [student] = await query(
        `SELECT student_id FROM student WHERE account_id = ?`,
        [session.account_id]
      );

      if (student) {
        const [submission] = await query(
          `SELECT * FROM submission WHERE assignment_id = ? AND student_id = ?`,
          [assignment.assignment_id, student.student_id]
        );
        assignment.submission = submission || null;
      } else {
        assignment.submission = null;
      }
    }

    return Response.json({
      course,
      assignments,
      materials,
      user,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

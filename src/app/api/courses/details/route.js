import { cookies } from "next/headers";
import { query } from "../../../../../lib/db";

export async function GET() {
  try {
    const cookieStore = cookies();
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

    console.log("Course fetched:", course);

    const assignments = await query(
      `SELECT * FROM assignment WHERE course_id = ?`,
      [courseId]
    );

    console.log("Assignments fetched:", assignments);

    const materials = await query(
      `SELECT * FROM material WHERE course_id = ?`,
      [courseId]
    );

    // Get the user's role
    const [user] = await query(
      `SELECT account_id, username, email, telephone, address, bio, role
     FROM Account 
     WHERE account_id = ?`,
      [session.account_id]
    );

    // Proceed with the rest of your logic...

    console.log("Materials fetched:", materials);

    for (const assignment of assignments) {
      const files = await query(
        `SELECT * FROM assignment_material WHERE assignment_id = ?`,
        [assignment.assignment_id]
      );
      assignment.materials = files;
      console.log(`Files for assignment ${assignment.assignment_id}:`, files);
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

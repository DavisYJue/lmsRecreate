import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Verify the session exists.
    const sessionCookie = cookies().get("session");
    if (!sessionCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const session = JSON.parse(sessionCookie.value);

    // Query courses that this user is enrolled in.
    // We assume an Enrollment table with columns (enrollment_id, account_id, course_id, ...)
    const courses = await query(
      `SELECT 
          c.course_id, 
          c.course_title AS title, 
          c.course_image AS imageUrl,
          CONCAT(DATE_FORMAT(c.start_date, '%b %Y'), ' - ', DATE_FORMAT(c.end_date, '%b %Y')) AS dateRange,
          c.course_type AS status
       FROM Course c
       JOIN Enrollment e ON c.course_id = e.course_id
       WHERE e.account_id = ?`,
      [session.account_id]
    );

    return Response.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

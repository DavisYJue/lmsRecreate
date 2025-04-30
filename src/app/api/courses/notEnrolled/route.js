import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get cookies synchronously
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;

    if (!courseId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "NO_COURSE_SELECTED",
          message: "Please select a course first",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use correct table name 'student' instead of 'students'
    const students = await query(
      `SELECT s.student_id, s.student_name, s.class
       FROM student s
       WHERE NOT EXISTS (
         SELECT 1 FROM enrollment e
         WHERE e.course_id = ? AND e.student_id = s.student_id
       )`,
      [parseInt(courseId, 10)]
    );

    return new Response(JSON.stringify(students), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "DATABASE_ERROR",
        message: "Failed to fetch student data",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

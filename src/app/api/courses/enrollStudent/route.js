import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { student_id, accountId } = await request.json();
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;

    if (!courseId || !student_id || !accountId) {
      return new Response(
        JSON.stringify({
          error: "MISSING_DATA",
          message: "Required data missing",
        }),
        { status: 400 }
      );
    }

    // Verify student exists
    const [student] = await query(
      "SELECT * FROM student WHERE student_id = ?",
      [student_id]
    );

    if (!student) {
      return new Response(
        JSON.stringify({
          error: "NOT_FOUND",
          message: "Student not found",
        }),
        { status: 404 }
      );
    }

    // Enroll student only
    await query(
      `INSERT INTO enrollment 
       (student_id, course_id, enrollment_date)
       VALUES (?, ?, NOW())`,
      [student_id, courseId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Student enrolled successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "DATABASE_ERROR",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

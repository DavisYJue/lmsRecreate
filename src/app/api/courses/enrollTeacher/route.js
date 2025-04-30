import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { teacher_id } = await request.json();
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;

    if (!courseId || !teacher_id) {
      return new Response(
        JSON.stringify({
          error: "MISSING_DATA",
          message: "Required data missing",
        }),
        { status: 400 }
      );
    }

    // Get teacher's account_id
    const [teacher] = await query(
      "SELECT account_id FROM teacher WHERE teacher_id = ?",
      [teacher_id]
    );

    if (!teacher) {
      return new Response(
        JSON.stringify({
          error: "NOT_FOUND",
          message: "Teacher not found",
        }),
        { status: 404 }
      );
    }

    await query(
      `INSERT INTO otherenrollment 
       (account_id, course_id, enrollment_date, status)
       VALUES (?, ?, NOW(), 'active')`,
      [teacher.account_id, courseId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teacher enrolled successfully",
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

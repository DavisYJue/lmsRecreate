import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;
    const { studentId } = await request.json();

    // Validate inputs
    if (!courseId || !studentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "MISSING_DATA",
          message: "Course ID or Student ID missing",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if enrollment exists
    const existingEnrollment = await query(
      `SELECT enrollment_id FROM enrollment 
       WHERE course_id = ? AND student_id = ?`,
      [courseId, studentId]
    );

    if (existingEnrollment.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ENROLLMENT_NOT_FOUND",
          message: "Student is not enrolled in this course",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Remove enrollment
    await query(
      `DELETE FROM enrollment 
       WHERE course_id = ? AND student_id = ?`,
      [parseInt(courseId, 10), parseInt(studentId, 10)]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Student successfully removed from course",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Removal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "SERVER_ERROR",
        message: "Failed to remove student",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

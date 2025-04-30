import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
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

    // Check if student exists
    const studentExists = await query(
      "SELECT student_id FROM student WHERE student_id = ?",
      [studentId]
    );

    if (studentExists.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "STUDENT_NOT_FOUND",
          message: "Student does not exist",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check existing enrollment
    const existingEnrollment = await query(
      `SELECT enrollment_id FROM enrollment 
       WHERE course_id = ? AND student_id = ?`,
      [courseId, studentId]
    );

    if (existingEnrollment.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DUPLICATE_ENROLLMENT",
          message: "Student already enrolled in this course",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get account_id from student table
    const studentData = await query(
      "SELECT account_id FROM student WHERE student_id = ?",
      [studentId]
    );

    // Create new enrollment
    const result = await query(
      `INSERT INTO enrollment 
       (course_id, student_id, account_id, enrollment_date, status)
       VALUES (?, ?, ?, CURDATE(), 'active')`,
      [
        parseInt(courseId, 10),
        parseInt(studentId, 10),
        studentData[0].account_id,
      ]
    );

    return new Response(
      JSON.stringify({
        success: true,
        enrollmentId: result.insertId,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "SERVER_ERROR",
        message: "Failed to enroll student",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

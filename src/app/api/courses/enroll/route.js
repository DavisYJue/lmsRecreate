import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const sessionCookie = cookies().get("session");
    if (!sessionCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const session = JSON.parse(sessionCookie.value);
    const { courseId } = await req.json();

    const account_id = session.account_id;

    // 🔍 1. Get the student_id associated with this account_id
    const studentResult = await query(
      `SELECT student_id FROM student WHERE account_id = ?`,
      [account_id]
    );

    if (studentResult.length === 0) {
      return Response.json(
        { error: "Student not found for this account" },
        { status: 404 }
      );
    }

    const student_id = studentResult[0].student_id;

    // ✅ 2. Check if the user is already enrolled
    const existingEnrollment = await query(
      `SELECT * FROM Enrollment WHERE account_id = ? AND course_id = ?`,
      [account_id, courseId]
    );

    if (existingEnrollment.length > 0) {
      return Response.json({ message: "Already enrolled" }, { status: 200 });
    }

    // 📝 3. Insert enrollment record
    await query(
      `INSERT INTO Enrollment (account_id, course_id, enrollment_date, student_id, status)
       VALUES (?, ?, NOW(), ?, 'active')`,
      [account_id, courseId, student_id]
    );

    return Response.json({ message: "Enrollment successful" }, { status: 200 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

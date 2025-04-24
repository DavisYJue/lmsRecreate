import { query } from "../../../../lib/db";
import { cookies } from "next/headers";
import { unlink } from "fs/promises";
import { join } from "path";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = JSON.parse(cookieStore.get("session")?.value || "{}");

    // Validate session
    if (!session.account_id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get student ID
    const [student] = await query(
      `SELECT student_id FROM student WHERE account_id = ?`,
      [session.account_id]
    );
    if (!student)
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });

    // Get assignment ID from request
    const { assignmentId } = await request.json();

    // Get submission details
    const [submission] = await query(
      `SELECT * FROM submission 
       WHERE assignment_id = ? AND student_id = ?`,
      [assignmentId, student.student_id]
    );

    if (!submission)
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404,
      });

    // Delete associated files
    const filePaths = submission.file_path.split(",");
    for (const filePath of filePaths) {
      try {
        const fullPath = join(process.cwd(), "public", filePath);
        await unlink(fullPath);
      } catch (error) {
        console.error("Error deleting file:", filePath, error);
      }
    }

    // Delete submission record
    await query(
      `DELETE FROM submission 
       WHERE submission_id = ?`,
      [submission.submission_id]
    );

    return new Response(
      JSON.stringify({ message: "Submission removed successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unsubmit error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { writeFile } from "fs/promises";
import { join } from "path";
import { query } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = JSON.parse(cookieStore.get("session")?.value || {});

    if (!session.account_id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [student] = await query(
      `SELECT student_id FROM student WHERE account_id = ?`,
      [session.account_id]
    );
    if (!student)
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });

    const formData = await request.formData();
    const files = formData.getAll("files");
    const assignmentId = formData.get("assignmentId");

    const [assignment] = await query(
      `SELECT * FROM assignment WHERE assignment_id = ?`,
      [assignmentId]
    );
    if (!assignment)
      return new Response(JSON.stringify({ error: "Invalid assignment" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const uploadDir = join(process.cwd(), "public", "submissions");
    const filePaths = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}-${file.name}`;
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, Buffer.from(buffer));
      filePaths.push(`/submissions/${filename}`);
    }

    const submissionTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await query(
      `INSERT INTO submission (assignment_id, student_id, submission_time, file_path)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         submission_time = VALUES(submission_time),
         file_path = VALUES(file_path)`,
      [assignmentId, student.student_id, submissionTime, filePaths.join(",")]
    );

    return new Response(
      JSON.stringify({
        message: "Submission successful",
        files: filePaths,
        submission_time: submissionTime,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

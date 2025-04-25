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

    // Check user role
    const [student, teacher] = await Promise.all([
      query(`SELECT student_id FROM student WHERE account_id = ?`, [
        session.account_id,
      ]),
      query(`SELECT teacher_id FROM teacher WHERE account_id = ?`, [
        session.account_id,
      ]),
    ]);

    const isStudent = student.length > 0;
    const isTeacher = teacher.length > 0;

    if (!isStudent && !isTeacher) {
      return new Response(JSON.stringify({ error: "User role not found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const assignmentId = formData.get("assignmentId");

    const [assignment] = await query(
      `SELECT * FROM assignment WHERE assignment_id = ?`,
      [assignmentId]
    );
    if (!assignment) {
      return new Response(JSON.stringify({ error: "Invalid assignment" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uploadDir = join(process.cwd(), "public", "submissions");
    const filePaths = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const filename = `${Date.now()}-${file.name}`;

      // Determine storage path based on role
      const roleSubdir = isStudent ? "student" : "other";
      const filePath = join(uploadDir, roleSubdir, filename);

      await writeFile(filePath, Buffer.from(buffer));
      filePaths.push(`/submissions/${roleSubdir}/${filename}`);
    }

    const submissionTime = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    if (isStudent) {
      await query(
        `INSERT INTO submission (assignment_id, student_id, submission_time, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           submission_time = VALUES(submission_time),
           file_path = VALUES(file_path)`,
        [
          assignmentId,
          student[0].student_id,
          submissionTime,
          filePaths.join(","),
        ]
      );
    } else {
      await query(
        `INSERT INTO OtherSubmission (assignment_id, account_id, submission_time, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           submission_time = VALUES(submission_time),
           file_path = VALUES(file_path)`,
        [assignmentId, session.account_id, submissionTime, filePaths.join(",")]
      );
    }

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

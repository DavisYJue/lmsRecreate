import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import Busboy from "busboy";
import { Readable } from "stream";
import { query } from "../../../../../lib/db";

// Disable Next’s default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID not in cookies" },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public/courseMaterials");
    await fs.mkdir(uploadDir, { recursive: true });

    // Create Busboy instance with correct headers
    const contentType = req.headers.get("content-type") || "";
    const bb = Busboy({ headers: { "content-type": contentType } });

    const fields = {};
    const filePaths = [];

    // Convert Web ReadableStream -> Node Readable and pipe into Busboy
    const nodeStream = Readable.fromWeb(req.body);
    nodeStream.pipe(bb);

    // Collect fields and files
    await new Promise((resolve, reject) => {
      bb.on("field", (name, val) => {
        fields[name] = val;
      });

      bb.on("file", (name, fileStream, info) => {
        const { filename } = info;
        const saveTo = path.join(uploadDir, filename);
        const out = fsSync.createWriteStream(saveTo);
        fileStream.pipe(out);
        filePaths.push(`/courseMaterials/${filename}`);
      });

      bb.on("error", reject);
      bb.on("finish", resolve);
    });

    const { assignmentTitle, assignmentDescription, dueDate } = fields;
    if (
      !assignmentTitle ||
      !assignmentDescription ||
      !dueDate ||
      filePaths.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Lookup teacher_id
    const [courseRow] = await query(
      "SELECT teacher_id FROM course WHERE course_id = ?",
      [courseId]
    );
    if (!courseRow) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 404 });
    }
    const teacherId = courseRow.teacher_id;

    // Insert assignment with default max_grade = 100
    const result = await query(
      `INSERT INTO assignment
        (assignment_title, assignment_description, max_grade, due_date, course_id, teacher_id, created_at, updated_at)
       VALUES (?, ?, 100, ?, ?, ?, NOW(), NOW())`,
      [assignmentTitle, assignmentDescription, dueDate, courseId, teacherId]
    );
    const assignmentId = result.insertId;

    // Insert materials
    for (const filePath of filePaths) {
      await query(
        `INSERT INTO assignment_material (assignment_id, file_path, course_id)
         VALUES (?, ?, ?)`,
        [assignmentId, filePath, courseId]
      );
    }

    return NextResponse.json(
      { message: "Assignment added successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Add Assignment Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

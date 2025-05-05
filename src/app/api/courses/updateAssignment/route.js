// src/app/api/courses/updateAssignment/route.js
import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import path from "path";
import fs from "fs";
import Busboy from "busboy";
import { cookies } from "next/headers";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public/courseMaterials");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

async function readStream(stream) {
  const chunks = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req) {
  const contentType = req.headers.get("content-type");
  if (!contentType?.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const assignmentId = cookieStore.get("selectedAssignmentId")?.value;
  const courseId = cookieStore.get("selectedCourseId")?.value;

  if (!assignmentId || !courseId) {
    return NextResponse.json(
      { error: "Missing assignment or course ID" },
      { status: 400 }
    );
  }

  try {
    const rawBody = await readStream(req.body);
    const busboy = Busboy({ headers: { "content-type": contentType } });
    const fields = {};
    const newFiles = [];

    const parsePromise = new Promise((resolve, reject) => {
      busboy.on("field", (name, value) => {
        fields[name] = value;
      });

      busboy.on("file", (name, file, info) => {
        const filename = info.filename;
        const savePath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(savePath);

        file.pipe(writeStream);
        file.on("end", () => {
          newFiles.push({
            path: `/courseMaterials/${filename}`,
            physicalPath: savePath,
          });
        });
      });

      busboy.on("error", (err) => reject(err));
      busboy.on("finish", resolve);

      busboy.write(rawBody);
      busboy.end();
    });

    await parsePromise;

    // Validate required fields
    const { assignment_title, assignment_description, due_date } = fields;
    if (!assignment_title || !assignment_description || !due_date) {
      // Cleanup newly uploaded files if validation fails
      newFiles.forEach(
        (file) =>
          fs.existsSync(file.physicalPath) && fs.unlinkSync(file.physicalPath)
      );
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get existing files before deletion
    const existingFiles = await query(
      "SELECT file_path FROM assignment_material WHERE assignment_id = ?",
      [assignmentId]
    );

    // Delete old physical files
    existingFiles.forEach((file) => {
      const filePath = path.join(process.cwd(), "public", file.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Delete old database records
    await query("DELETE FROM assignment_material WHERE assignment_id = ?", [
      assignmentId,
    ]);

    // Update assignment details
    await query(
      `UPDATE assignment SET
        assignment_title = ?,
        assignment_description = ?,
        due_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE assignment_id = ?`,
      [assignment_title, assignment_description, due_date, assignmentId]
    );

    // Insert new files
    for (const file of newFiles) {
      await query(
        "INSERT INTO assignment_material (assignment_id, course_id, file_path) VALUES (?, ?, ?)",
        [assignmentId, courseId, file.path]
      );
    }

    return NextResponse.json(
      { message: "Assignment updated successfully with file replacement" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    // Cleanup any partially uploaded files on error
    newFiles?.forEach(
      (file) =>
        fs.existsSync(file.physicalPath) && fs.unlinkSync(file.physicalPath)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

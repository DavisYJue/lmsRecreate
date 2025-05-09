import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import path from "path";
import fs from "fs";
import Busboy from "busboy";
import { cookies } from "next/headers";

export const config = { api: { bodyParser: false } };

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
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

  try {
    const rawBody = await readStream(req.body);
    const busboy = Busboy({ headers: { "content-type": contentType } });
    const fields = {};
    const newFiles = [];
    let keepExistingFiles = false;
    const timestamp = Date.now();

    await new Promise((resolve, reject) => {
      busboy.on("field", (name, value) => {
        if (name === "keep_existing_files") {
          keepExistingFiles = value === "true";
        } else {
          fields[name] = value;
        }
      });

      busboy.on("file", (name, file, info) => {
        const originalName = info.filename;
        const newName = `${timestamp}-${originalName}`;
        const savePath = path.join(uploadDir, newName);
        const writeStream = fs.createWriteStream(savePath);

        file.pipe(writeStream).on("finish", () => {
          newFiles.push({
            path: `/courseMaterials/${newName}`,
            physicalPath: savePath,
          });
        });
      });

      busboy.on("error", reject);
      busboy.on("finish", resolve);
      busboy.write(rawBody);
      busboy.end();
    });

    const { assignment_title, assignment_description, due_date } = fields;
    if (!assignment_title || !assignment_description || !due_date) {
      newFiles.forEach(
        (file) =>
          fs.existsSync(file.physicalPath) && fs.unlinkSync(file.physicalPath)
      );
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!keepExistingFiles) {
      const existingFiles = await query(
        "SELECT file_path FROM assignment_material WHERE assignment_id = ?",
        [assignmentId]
      );
      existingFiles.forEach((file) => {
        const filePath = path.join(process.cwd(), "public", file.file_path);
        fs.existsSync(filePath) && fs.unlinkSync(filePath);
      });

      await query("DELETE FROM assignment_material WHERE assignment_id = ?", [
        assignmentId,
      ]);
    }

    await query(
      `UPDATE assignment SET
        assignment_title = ?, assignment_description = ?, due_date = ?, updated_at = NOW()
       WHERE assignment_id = ?`,
      [assignment_title, assignment_description, due_date, assignmentId]
    );

    if (newFiles.length > 0) {
      for (const file of newFiles) {
        await query(
          "INSERT INTO assignment_material (assignment_id, course_id, file_path) VALUES (?, ?, ?)",
          [assignmentId, courseId, file.path]
        );
      }
    }

    return NextResponse.json(
      { message: "Assignment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Processing error:", error);
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

import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import path from "path";
import fs from "fs";
import Busboy from "busboy";
import { cookies } from "next/headers";

// Ensure directory exists
const uploadDir = path.join(process.cwd(), "public/courseMaterials");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function POST(req) {
  const cookieStore = await cookies();
  const assignmentId = cookieStore.get("selectedAssignmentId")?.value;

  if (!assignmentId) {
    return NextResponse.json(
      { error: "Missing assignment ID" },
      { status: 400 }
    );
  }

  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  const files = [];

  const parsePromise = new Promise((resolve, reject) => {
    busboy.on("field", (name, val) => {
      fields[name] = val;
    });

    busboy.on("file", (name, file, info) => {
      const { filename } = info;
      const saveTo = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(saveTo);

      file.pipe(writeStream);
      file.on("end", () => {
        files.push(`/courseMaterials/${filename}`);
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", resolve);

    req.body.pipe(busboy);
  });

  await parsePromise;

  const { assignment_title, assignment_description, due_date } = fields;

  if (!assignment_title || !assignment_description || !due_date) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Update assignment info
    await query(
      `UPDATE assignment
       SET assignment_title = ?, assignment_description = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE assignment_id = ?`,
      [assignment_title, assignment_description, due_date, assignmentId]
    );

    // Add any new uploaded files
    for (const filePath of files) {
      await query(
        "INSERT INTO assignment_material (assignment_id, file_path) VALUES (?, ?)",
        [assignmentId, filePath]
      );
    }

    return NextResponse.json(
      { message: "Assignment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs";
import Busboy from "busboy";
import { PassThrough } from "stream";

const materialsDir = path.join(process.cwd(), "public", "materials");

if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const courseId = cookieStore.get("selectedCourseId")?.value;

  if (!courseId) {
    return NextResponse.json({ error: "No course selected." }, { status: 400 });
  }

  const courseResults = await query(
    "SELECT course_title, course_description FROM course WHERE course_id = ?",
    [courseId]
  );

  if (courseResults.length === 0) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
  const courseData = courseResults[0];

  const materialResults = await query(
    "SELECT * FROM material WHERE course_id = ?",
    [courseId]
  );

  return NextResponse.json({
    materials: materialResults,
    course: courseData,
  });
}

export async function POST(req) {
  const cookieStore = await cookies();
  const courseId = cookieStore.get("selectedCourseId")?.value;
  const session = cookieStore.get("session")?.value;
  const accountId = session ? JSON.parse(session).account_id : null;

  if (!courseId || !accountId) {
    return NextResponse.json(
      { error: "Missing session or course ID." },
      { status: 400 }
    );
  }

  try {
    const contentType = req.headers.get("content-type");
    const body = req.body;

    if (!contentType?.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const busboy = Busboy({ headers: { "content-type": contentType } });
    const stream = new PassThrough();
    let title = "";
    let filePath = "";
    let fileName = "";

    busboy.on("field", (name, value) => {
      if (name === "title") title = value;
    });

    busboy.on("file", (name, file, info) => {
      const { filename } = info;
      const safeName = `${Date.now()}-${filename.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_"
      )}`;
      filePath = `/materials/${safeName}`;
      fileName = path.join(materialsDir, safeName);

      const writeStream = fs.createWriteStream(fileName);
      file.pipe(writeStream);
    });

    busboy.on("error", (err) => {
      console.error("Busboy error:", err);
      return NextResponse.json(
        { error: "File upload failed" },
        { status: 500 }
      );
    });

    busboy.on("finish", async () => {
      try {
        await query(
          `INSERT INTO material (material_title, material_file, course_id, uploaded_by, uploaded_at)
             VALUES (?, ?, ?, ?, NOW())`,
          [title, filePath, courseId, accountId]
        );
      } catch (err) {
        console.error("Database error:", err);
        return NextResponse.json(
          { error: "Failed to save record" },
          { status: 500 }
        );
      }
    });

    const reader = body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        stream.end();
        break;
      }
      stream.write(value);
    }

    stream.pipe(busboy);

    await new Promise((resolve) => busboy.on("finish", resolve));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const { material_id } = await req.json();

  if (!material_id) {
    return NextResponse.json(
      { error: "Missing material ID." },
      { status: 400 }
    );
  }

  const rows = await query(
    "SELECT material_file FROM material WHERE material_id = ?",
    [material_id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", rows[0].material_file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await query("DELETE FROM material WHERE material_id = ?", [material_id]);
  return NextResponse.json({ success: true });
}

export async function PUT(req) {
  const { material_id, new_title } = await req.json();

  if (!material_id || !new_title?.trim()) {
    return NextResponse.json(
      { error: "Missing required data." },
      { status: 400 }
    );
  }

  try {
    await query(
      "UPDATE material SET material_title = ? WHERE material_id = ?",
      [new_title.trim(), material_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const accountId = session ? JSON.parse(session).account_id : null;

  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type");
    if (!contentType?.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const busboy = Busboy({ headers: { "content-type": contentType } });
    const stream = new PassThrough();

    let materialId;
    let filePath = "";
    let fileName = "";

    busboy.on("field", (name, value) => {
      if (name === "material_id") materialId = value;
    });

    busboy.on("file", (name, file, info) => {
      const { filename } = info;
      const safeName = `${Date.now()}-${filename.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_"
      )}`;
      filePath = `/materials/${safeName}`;
      fileName = path.join(materialsDir, safeName);

      const writeStream = fs.createWriteStream(fileName);
      file.pipe(writeStream);
    });

    const processPromise = new Promise((resolve, reject) => {
      busboy.on("finish", async () => {
        try {
          if (!materialId) {
            return reject(new Error("Missing material ID"));
          }

          const [oldFile] = await query(
            "SELECT material_file FROM material WHERE material_id = ?",
            [materialId]
          );

          if (oldFile?.material_file) {
            const oldPath = path.join(
              process.cwd(),
              "public",
              oldFile.material_file
            );
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }

          await query(
            "UPDATE material SET material_file = ? WHERE material_id = ?",
            [filePath, materialId]
          );

          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      });

      busboy.on("error", (error) => {
        reject(new Error(`File upload failed: ${error.message}`));
      });
    });

    const reader = req.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stream.write(value);
      }
      stream.end();
      stream.pipe(busboy);
    } catch (error) {
      return NextResponse.json(
        { error: "Error reading request body" },
        { status: 500 }
      );
    }

    const result = await processPromise;
    return NextResponse.json(result);
  } catch (error) {
    console.error("File update error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

import { writeFile } from "fs/promises";
import { join, extname } from "path";
import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";
import fs from "fs";

export async function POST(request) {
  try {
    // Get session from cookies
    const cookieStore = await cookies();
    const session = JSON.parse(cookieStore.get("session")?.value || "{}");

    if (!session.account_id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check user role
    const [teacher] = await query(
      `SELECT teacher_id FROM teacher WHERE account_id = ?`,
      [session.account_id]
    );

    if (!teacher) {
      return new Response(JSON.stringify({ error: "User is not a teacher" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse form data
    const formData = await request.formData();
    const courseTitle = formData.get("courseTitle");
    const courseDescription = formData.get("courseDescription");
    const courseVisibility = formData.get("courseVisibility");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const courseImage = formData.get("courseImage");

    let imagePath = null; // Will remain null if no image is uploaded

    // Only process image if provided
    if (courseImage && courseImage.size > 0) {
      // Ensure upload directory exists
      const uploadDir = join(process.cwd(), "public", "courses");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Build timestamp-indexed filename
      const imageExt = extname(courseImage.name);
      const timestamp = Date.now();
      const imageName = `${timestamp}-1${imageExt}`; // e.g. "1745952314236-1.jpg"
      const filePath = join(uploadDir, imageName);

      // Write file to server
      const buffer = await courseImage.arrayBuffer();
      await writeFile(filePath, Buffer.from(buffer));

      // Store relative path for DB
      imagePath = `courses/${imageName}`;
    }

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const courseDuration = Math.ceil((end - start) / (1000 * 3600 * 24));

    // Insert into database
    const sql = `
      INSERT INTO course (
        course_title,
        course_description,
        course_image,
        course_type,
        start_date,
        end_date,
        course_duration,
        teacher_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      courseTitle,
      courseDescription,
      imagePath, // null if no image, or "courses/<timestamp>-1.ext"
      courseVisibility,
      startDate,
      endDate,
      courseDuration,
      teacher.teacher_id,
    ];

    await query(sql, params);

    return new Response(
      JSON.stringify({ message: "Course added successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding course:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// app/api/courses/delete/route.js
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from "../../../../../lib/db";

export async function DELETE(req) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get all assignment IDs for this course
    const assignments = await query(
      "SELECT assignment_id FROM assignment WHERE course_id = ?",
      [courseId]
    );
    const assignmentIds = assignments.map((a) => a.assignment_id);

    // Collect all file paths
    const allPaths = [];

    // 1. Material files
    const materials = await query(
      "SELECT material_file FROM material WHERE course_id = ?",
      [courseId]
    );
    materials.forEach(({ material_file }) => {
      if (material_file) allPaths.push(material_file);
    });

    // 2. Assignment materials (directly by course_id)
    const assignmentMaterials = await query(
      "SELECT file_path FROM assignment_material WHERE course_id = ?",
      [courseId]
    );
    assignmentMaterials.forEach(({ file_path }) => {
      if (file_path) allPaths.push(file_path);
    });

    // 3. Submissions (through assignment IDs)
    if (assignmentIds.length > 0) {
      const placeholders = assignmentIds.map(() => "?").join(",");

      // Student submissions
      const submissions = await query(
        `SELECT file_path FROM submission WHERE assignment_id IN (${placeholders})`,
        assignmentIds
      );
      submissions.forEach(({ file_path }) => {
        if (file_path) allPaths.push(file_path);
      });

      // Other submissions
      const otherSubmissions = await query(
        `SELECT file_path FROM othersubmission WHERE assignment_id IN (${placeholders})`,
        assignmentIds
      );
      otherSubmissions.forEach(({ file_path }) => {
        if (file_path) {
          file_path
            .split(",")
            .forEach((p) => p.trim() && allPaths.push(p.trim()));
        }
      });
    }

    // Delete files from filesystem
    await Promise.all(
      allPaths.map(async (relativePath) => {
        const fullPath = path.join(
          process.cwd(),
          "public",
          relativePath.startsWith("/") ? relativePath.slice(1) : relativePath
        );

        try {
          await fs.unlink(fullPath);
        } catch (error) {
          console.warn(`Failed to delete file: ${fullPath}`, error.message);
        }
      })
    );

    // Delete database records in proper order
    const deletionSteps = [
      // Delete submissions
      async () => {
        if (assignmentIds.length > 0) {
          const placeholders = assignmentIds.map(() => "?").join(",");
          await query(
            `DELETE FROM submission WHERE assignment_id IN (${placeholders})`,
            assignmentIds
          );
          await query(
            `DELETE FROM othersubmission WHERE assignment_id IN (${placeholders})`,
            assignmentIds
          );
        }
      },
      // Delete assignment-related records
      () =>
        query("DELETE FROM assignment_material WHERE course_id = ?", [
          courseId,
        ]),
      () => query("DELETE FROM assignment WHERE course_id = ?", [courseId]),
      // Delete course-related records

      () => query("DELETE FROM material WHERE course_id = ?", [courseId]),
      () => query("DELETE FROM enrollment WHERE course_id = ?", [courseId]),
      () =>
        query("DELETE FROM otherenrollment WHERE course_id = ?", [courseId]),
      () =>
        query("DELETE FROM teaching_assistant WHERE course_id = ?", [courseId]),
      () => query("DELETE FROM course WHERE course_id = ?", [courseId]),
    ];

    for (const step of deletionSteps) {
      await step();
    }

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: `Failed to delete course: ${error.message}` },
      { status: 500 }
    );
  }
}

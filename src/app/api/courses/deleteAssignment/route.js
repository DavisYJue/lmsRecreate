// app/api/courses/deleteAssignment/route.js

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from "../../../../../lib/db";

export async function DELETE(req) {
  try {
    const { assignment_id } = await req.json();
    if (!assignment_id) {
      return NextResponse.json(
        { error: "Missing assignment_id" },
        { status: 400 }
      );
    }

    // 1. Gather all file paths before deleting rows

    // 1a. Assignment materials
    const mats = await query(
      "SELECT file_path FROM assignment_material WHERE assignment_id = ?",
      [assignment_id]
    );

    // 1b. Student submissions
    const studs = await query(
      "SELECT file_path FROM submission WHERE assignment_id = ?",
      [assignment_id]
    );

    // 1c. Other-role submissions
    const others = await query(
      "SELECT file_path FROM othersubmission WHERE assignment_id = ?",
      [assignment_id]
    );

    const allPaths = [];

    // Normalize and collect material file paths
    for (const row of mats) {
      // e.g. "/courseMaterials/1746-1.jpg"
      if (row.file_path) allPaths.push(row.file_path);
    }

    // For submissions, file_path may be comma-separated
    const collectSplit = (row) => {
      if (!row.file_path) return;
      row.file_path
        .split(",")
        .map((p) => p.trim())
        .forEach((p) => p && allPaths.push(p));
    };
    studs.forEach(collectSplit);
    others.forEach(collectSplit);

    // 2. Unlink each file on disk
    for (const relPath of allPaths) {
      // build absolute path: remove leading slash if present
      const safePath = relPath.startsWith("/") ? relPath.slice(1) : relPath;
      const fullPath = path.join(process.cwd(), "public", safePath);

      try {
        await fs.unlink(fullPath);
      } catch (e) {
        // if file missing or permission error, just log and continue
        console.warn(`Could not delete file ${fullPath}:`, e.message);
      }
    }

    // 3. Delete DB rows (cascade)
    await query("DELETE FROM submission WHERE assignment_id = ?", [
      assignment_id,
    ]);
    await query("DELETE FROM othersubmission WHERE assignment_id = ?", [
      assignment_id,
    ]);
    await query("DELETE FROM assignment_material WHERE assignment_id = ?", [
      assignment_id,
    ]);
    await query("DELETE FROM assignment WHERE assignment_id = ?", [
      assignment_id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Assignment and all related files deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

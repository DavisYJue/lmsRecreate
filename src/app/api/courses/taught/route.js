import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db"; // Import the query function from lib/db

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { account_id, role } = JSON.parse(session.value);

    let courses;

    // Fetch courses based on the role
    if (role === "teacher") {
      // Teacher: Fetch courses where teacher_id matches the logged-in user
      const sql = `SELECT course_id, course_title, course_description 
                   FROM course 
                   WHERE teacher_id = ?`;
      courses = await query(sql, [account_id]);
    } else if (role === "assistant") {
      // Assistant: First, fetch the assistant_id using account_id
      const assistantSql = `SELECT assistant_id FROM assistant WHERE account_id = ?`;
      const assistantResult = await query(assistantSql, [account_id]);

      if (assistantResult.length === 0) {
        return NextResponse.json(
          { message: "Assistant not found" },
          { status: 404 }
        );
      }

      const assistant_id = assistantResult[0].assistant_id;

      // Fetch courses linked through the assistant_course table using assistant_id
      const sql = `SELECT c.course_id, c.course_title, c.course_description
                   FROM course c
                   JOIN assistant_course ac ON ac.course_id = c.course_id
                   WHERE ac.assistant_id = ?`;
      courses = await query(sql, [assistant_id]);
    } else if (role === "administrator") {
      // New administrator logic: get all courses
      const sql = `SELECT course_id, course_title, course_description 
                   FROM course`;
      courses = await query(sql);
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

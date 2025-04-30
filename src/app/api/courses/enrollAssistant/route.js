import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { assistant_id } = await request.json();
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;

    if (!courseId || !assistant_id) {
      return new Response(
        JSON.stringify({
          error: "MISSING_DATA",
          message: "Required data missing",
        }),
        { status: 400 }
      );
    }

    // Get assistant's account_id
    const [assistant] = await query(
      "SELECT account_id FROM assistant WHERE assistant_id = ?",
      [assistant_id]
    );

    if (!assistant) {
      return new Response(
        JSON.stringify({
          error: "NOT_FOUND",
          message: "Assistant not found",
        }),
        { status: 404 }
      );
    }

    await query(
      `INSERT INTO otherenrollment 
       (account_id, course_id, enrollment_date, status)
       VALUES (?, ?, NOW(), 'active')`,
      [assistant.account_id, courseId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Assistant enrolled successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "DATABASE_ERROR",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}

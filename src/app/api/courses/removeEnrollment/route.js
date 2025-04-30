import { query } from "../../../../../lib/db";
import { cookies } from "next/headers";

export async function DELETE(request) {
  try {
    const { accountId } = await request.json();
    const cookieStore = await cookies();
    const courseId = cookieStore.get("selectedCourseId")?.value;

    if (!courseId || !accountId) {
      return new Response(
        JSON.stringify({
          error: "MISSING_DATA",
          message: "Required data missing",
        }),
        { status: 400 }
      );
    }

    await query(
      `DELETE FROM otherenrollment 
       WHERE account_id = ? AND course_id = ?`,
      [accountId, courseId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Enrollment removed successfully",
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

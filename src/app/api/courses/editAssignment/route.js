// /api/courses/editAssignment/route.js
import { cookies } from "next/headers";
import { query } from "../../../../../lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const assignmentId = cookieStore.get("selectedAssignmentId")?.value;

  if (!assignmentId) {
    return new Response(
      JSON.stringify({ error: "Assignment ID not found in cookies" }),
      { status: 400 }
    );
  }

  try {
    const [assignment] = await query(
      "SELECT assignment_id, assignment_title, assignment_description, due_date FROM assignment WHERE assignment_id = ?",
      [assignmentId]
    );

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(assignment), { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

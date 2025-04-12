import { query } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const sessionCookie = cookies().get("session");

    if (!sessionCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const [user] = await query(
      `SELECT account_id, username, role, email 
       FROM Account 
       WHERE account_id = ?`,
      [session.account_id]
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      account_id: user.account_id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

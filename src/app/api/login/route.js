import { query } from "../../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  try {
    // Validate input
    if (!username || username.length < 3) {
      return Response.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Get account with case-sensitive match
    const results = await query(
      "SELECT * FROM Account WHERE BINARY username = ?",
      [username]
    );

    // Security: Never return password in production!
    return Response.json(results);
  } catch (error) {
    console.error("Account lookup error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { query } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get account from database
    const [account] = await query(
      `SELECT account_id, username, password, role 
       FROM Account 
       WHERE BINARY username = ?`,
      [username.trim()]
    );

    // Check credentials
    if (!account || account.password !== password.trim()) {
      return Response.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "session",
      JSON.stringify({
        account_id: account.account_id,
        role: account.role,
        username: account.username,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      }
    );

    return Response.json({
      success: true,
      role: account.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    // Ensure error response is JSON
    return Response.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

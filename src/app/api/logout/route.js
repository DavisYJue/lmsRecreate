import { cookies } from "next/headers";

export async function POST() {
  try {
    cookies().delete("session");
    return Response.json({ message: "Logged out successfully" });
  } catch (error) {
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}

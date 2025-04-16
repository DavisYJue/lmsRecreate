import { query } from "../../../../lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookiestore = await cookies();
    const sessionCookie = cookiestore.get("session");

    if (!sessionCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const [user] = await query(
      `SELECT account_id, username, email, telephone, address, bio, role
       FROM Account 
       WHERE account_id = ?`,
      [session.account_id]
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("Authentication error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const sessionCookie = cookies().get("session");
  if (!sessionCookie) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const session = JSON.parse(sessionCookie.value);
  const body = await request.json();

  try {
    // Optional check
    if (body.newPassword && body.newPassword !== body.confirmNewPassword) {
      return Response.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const updateFields = [];
    const params = [];

    if (body.username) {
      updateFields.push("username = ?");
      params.push(body.username);
    }
    if (body.email) {
      updateFields.push("email = ?");
      params.push(body.email);
    }
    if (body.telephone) {
      updateFields.push("telephone = ?");
      params.push(body.telephone);
    }
    if (body.address) {
      updateFields.push("address = ?");
      params.push(body.address);
    }
    if (body.bio) {
      updateFields.push("bio = ?");
      params.push(body.bio);
    }
    if (body.newPassword) {
      if (
        !body.confirmNewPassword ||
        body.newPassword.length < 8 ||
        body.newPassword !== body.confirmNewPassword
      ) {
        return Response.json(
          {
            error:
              "Invalid password. It must be at least 8 characters and both fields must match.",
          },
          { status: 400 }
        );
      }

      updateFields.push("password = ?");
      params.push(body.newPassword);
    }

    params.push(session.account_id);

    await query(
      `UPDATE Account SET ${updateFields.join(", ")} WHERE account_id = ?`,
      params
    );

    return Response.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

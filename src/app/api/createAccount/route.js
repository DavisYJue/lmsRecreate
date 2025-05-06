import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import fs from "fs";
import path from "path";
import Busboy from "busboy";

export const config = {
  api: { bodyParser: false },
};

async function saveProfileImage(buffer, filename) {
  const uploadDir = path.join(process.cwd(), "public", "profile");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const uniqueName = `${Date.now()}-${filename}`;
  await fs.promises.writeFile(path.join(uploadDir, uniqueName), buffer);
  return `/profile/${uniqueName}`;
}

export async function POST(request) {
  try {
    // --- parse multipart/form-data with Busboy ---
    const headers = Object.fromEntries(request.headers.entries());
    const bb = Busboy({ headers });
    const fields = {};
    let fileUpload = null;

    const parsing = new Promise((resolve, reject) => {
      bb.on("field", (name, val) => {
        fields[name] = val;
      });
      bb.on("file", (name, fileStream, info) => {
        if (name === "profile_image") {
          const chunks = [];
          fileStream.on("data", (c) => chunks.push(c));
          fileStream.on("end", () => {
            fileUpload = {
              buffer: Buffer.concat(chunks),
              filename: info.filename,
            };
          });
        } else {
          fileStream.resume();
        }
      });
      bb.on("error", reject);
      bb.on("finish", resolve);
    });

    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bb.write(value);
    }
    bb.end();
    await parsing;

    // --- extract fields ---
    const username = (fields.username || "").trim();
    const email = (fields.email || "").trim();
    const role = (fields.role || "").trim();
    const password = fields.password || "";

    const telephone = (fields.telephone || "").trim() || null;
    const address = (fields.address || "").trim() || null;
    const bio = (fields.bio || "").trim() || null;

    // --- validate required ---
    if (!username || !email || !role || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- enforce password length ---
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // --- optional image upload ---
    let profileImagePath = null;
    if (fileUpload && fileUpload.buffer.length) {
      profileImagePath = await saveProfileImage(
        fileUpload.buffer,
        fileUpload.filename
      );
    }

    // --- insert into DB ---
    await query(
      `INSERT INTO account
         (username, email, telephone, address, bio, role, password, profile_image, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        username,
        email,
        telephone,
        address,
        bio,
        role,
        password,
        profileImagePath, // NULL if no upload
      ]
    );

    return NextResponse.json({ message: "Account created successfully" });
  } catch (err) {
    console.error(" ACCOUNT CREATION ERR:", err);

    // --- duplicate-entry handling ---
    if (err.code === "ER_DUP_ENTRY") {
      if (err.sqlMessage.includes("account.username")) {
        return NextResponse.json(
          { message: "Username already exists." },
          { status: 400 }
        );
      }
      if (err.sqlMessage.includes("account.email")) {
        return NextResponse.json(
          { message: "Email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "Duplicate entry detected." },
        { status: 400 }
      );
    }

    // --- fallback ---
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return NextResponse.json(
        { message: "Valid email and password (minimum 8 characters) required" },
        { status: 400 }
      );
    }

    const [existing]: any = await pool.execute(
      "SELECT id FROM admins LIMIT 1"
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Admin account already exists" },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
      [email.toLowerCase().trim(), passwordHash]
    );

    return NextResponse.json({
      message: "Admin account created successfully",
    });
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      { message: "Setup failed" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - View all teachers
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM teachers ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch Teachers Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

// POST - Add new teacher
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      email,
      subject,
      phone,
      experience,
      status,
    } = body;

    await pool.query(
      `INSERT INTO teachers
       (id, name, email, subject, phone, experience, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        subject,
        phone,
        Number(experience) || 0,
        status || "Active",
      ]
    );

    return NextResponse.json(
      { message: "Teacher added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Teacher Error:", error);

    return NextResponse.json(
      { message: "Failed to add teacher" },
      { status: 500 }
    );
  }
}

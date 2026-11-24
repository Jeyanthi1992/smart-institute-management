
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - View all courses
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM courses ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch Courses Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST - Add new course
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id, name, duration, fee, description, status } = body;

    await pool.query(
      `INSERT INTO courses
       (id, name, duration, fee, description, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        duration,
        Number(fee) || 0,
        description || "",
        status || "Active",
      ]
    );

    return NextResponse.json(
      { message: "Course added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Course Error:", error);

    return NextResponse.json(
      { message: "Failed to add course" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - View all attendance
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch Attendance Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST - Add attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id, student_name, course, attendance_date, status } = body;

    await pool.query(
      `INSERT INTO attendance
       (id, student_name, course, attendance_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, student_name, course, attendance_date, status]
    );

    return NextResponse.json(
      { message: "Attendance added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Attendance Error:", error);

    return NextResponse.json(
      { message: "Failed to add attendance" },
      { status: 500 }
    );
  }
}

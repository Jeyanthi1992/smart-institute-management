
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - Read all students
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST - Add new student
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id, name, email, course, phone, status } = body;

    await pool.query(
      `INSERT INTO students
       (id, name, email, course, phone, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, email, course, phone, status || "Active"]
    );

    return NextResponse.json(
      { message: "Student added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to add student" },
      { status: 500 }
    );
  }
}

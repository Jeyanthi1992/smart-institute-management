
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// UPDATE - Edit student
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, email, course, phone, status } = body;

    const [result]: any = await pool.query(
      `UPDATE students
       SET name = ?, email = ?, course = ?, phone = ?, status = ?
       WHERE id = ?`,
      [name, email, course, phone, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update student" },
      { status: 500 }
    );
  }
}

// DELETE - Delete student
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete student" },
      { status: 500 }
    );
  }
}

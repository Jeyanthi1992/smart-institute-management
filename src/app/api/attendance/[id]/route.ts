
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT - Update attendance
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { student_name, course, attendance_date, status } = body;

    const [result]: any = await pool.query(
      `UPDATE attendance
       SET student_name = ?, course = ?, attendance_date = ?, status = ?
       WHERE id = ?`,
      [student_name, course, attendance_date, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Attendance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error("Update Attendance Error:", error);

    return NextResponse.json(
      { message: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

// DELETE - Delete attendance
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      "DELETE FROM attendance WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Attendance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    console.error("Delete Attendance Error:", error);

    return NextResponse.json(
      { message: "Failed to delete attendance" },
      { status: 500 }
    );
  }
}

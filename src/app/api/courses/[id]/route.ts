
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT - Update course
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, duration, fee, description, status } = body;

    const [result]: any = await pool.query(
      `UPDATE courses
       SET name = ?, duration = ?, fee = ?, description = ?, status = ?
       WHERE id = ?`,
      [name, duration, Number(fee) || 0, description || "", status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Update Course Error:", error);

    return NextResponse.json(
      { message: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      "DELETE FROM courses WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);

    return NextResponse.json(
      { message: "Failed to delete course" },
      { status: 500 }
    );
  }
}

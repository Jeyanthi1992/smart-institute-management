
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// UPDATE - Edit teacher
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      email,
      subject,
      phone,
      experience,
      status,
    } = body;

    const [result]: any = await pool.query(
      `UPDATE teachers
       SET name = ?, email = ?, subject = ?, phone = ?,
           experience = ?, status = ?
       WHERE id = ?`,
      [
        name,
        email,
        subject,
        phone,
        Number(experience) || 0,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Teacher updated successfully",
    });

  } catch (error) {
    console.error("Update Teacher Error:", error);

    return NextResponse.json(
      { message: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE - Delete teacher
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      "DELETE FROM teachers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Teacher deleted successfully",
    });

  } catch (error) {
    console.error("Delete Teacher Error:", error);

    return NextResponse.json(
      { message: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}

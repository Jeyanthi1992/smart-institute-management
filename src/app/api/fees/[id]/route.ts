
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// PUT - Update fee
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      student_name,
      course,
      total_fee,
      paid_amount,
      payment_date,
      payment_mode,
    } = body;

    const [result]: any = await pool.query(
      `UPDATE fees
       SET student_name = ?, course = ?, total_fee = ?,
           paid_amount = ?, payment_date = ?, payment_mode = ?
       WHERE id = ?`,
      [
        student_name,
        course,
        Number(total_fee),
        Number(paid_amount),
        payment_date,
        payment_mode,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Fee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Fee updated successfully" });
  } catch (error) {
    console.error("Update Fee Error:", error);
    return NextResponse.json(
      { message: "Failed to update fee" },
      { status: 500 }
    );
  }
}

// DELETE - Delete fee
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      "DELETE FROM fees WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Fee record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Fee deleted successfully" });
  } catch (error) {
    console.error("Delete Fee Error:", error);
    return NextResponse.json(
      { message: "Failed to delete fee" },
      { status: 500 }
    );
  }
}

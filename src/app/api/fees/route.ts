
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - Fetch all fees
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM fees ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch Fees Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch fees" },
      { status: 500 }
    );
  }
}

// POST - Add new fee
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      student_name,
      course,
      total_fee,
      paid_amount,
      payment_date,
      payment_mode,
    } = body;

    const [result] = await pool.query(
      `INSERT INTO fees
      (id, student_name, course, total_fee, paid_amount, payment_date, payment_mode)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        student_name,
        course,
        Number(total_fee),
        Number(paid_amount),
        payment_date,
        payment_mode,
      ]
    );

    return NextResponse.json(
      { message: "Fee added successfully", result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Fee Error:", error);

    return NextResponse.json(
      { message: "Failed to add fee" },
      { status: 500 }
    );
  }
}

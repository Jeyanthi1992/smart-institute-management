
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    return NextResponse.json({
      success: true,
      message: "MySQL Database Connected Successfully!",
      data: rows,
    });
  } catch (error) {
    console.error("Database Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database Connection Failed",
      },
      { status: 500 }
    );
  }
}

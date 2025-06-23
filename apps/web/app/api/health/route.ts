import { NextResponse } from "next/server";

/**
 * Health check endpoint to verify the app is running
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
}
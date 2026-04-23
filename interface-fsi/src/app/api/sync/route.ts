import { NextResponse } from "next/server";
import { syncAllClientsFromWorkbook } from "@/lib/workbook-sync";

export async function POST() {
  try {
    const summary = await syncAllClientsFromWorkbook();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error syncing workbook to database:", error);
    return NextResponse.json(
      { error: "Failed to synchronize workbook to database" },
      { status: 500 },
    );
  }
}

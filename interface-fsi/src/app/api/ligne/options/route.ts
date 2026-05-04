import { NextResponse } from "next/server";

import { loadDebitAdslOptions } from "@/lib/debitOptions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { options, source } = await loadDebitAdslOptions();
    return NextResponse.json({ debitADSL: options, source });
  } catch (error) {
    console.error("Unable to load DebitADSL options:", error);
    return NextResponse.json({ debitADSL: [], source: "none" });
  }
}

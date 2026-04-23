import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isDatabaseUnavailableError,
  PRODUCTION_DATABASE_ERROR_MESSAGE,
} from "@/lib/runtime";

export const dynamic = "force-dynamic";

interface LigneData {
  dLigne: string;
  referenceExtranet: string;
  downtimeStart: string;
  openTime: string;
  refHPSM: string;
  problemStatus: string;
  closeTime: string;
  resolutionCode: string;
  region: string;
  offre: string;
  briefDescription: string;
  debitADSL: string;
  fsiADSL: string;
  productType: string;
  resolutionObservation: string;
  ttResolutionDuration: string;
  actionFSI: string;
}

function formatDate(value: Date | null | undefined) {
  return value ? value.toString() : "";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dlNumber = searchParams.get("dl");

  if (!dlNumber) {
    return NextResponse.json({ error: "DL number is required" }, { status: 400 });
  }

  try {
    const normalizedDLigne = dlNumber.trim();
    const client = await prisma.client.findUnique({
      where: { dLigne: normalizedDLigne },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Ligne not found", found: false },
        { status: 404 },
      );
    }

    const result: LigneData = {
      dLigne: client.dLigne,
      referenceExtranet: client.referenceExtranet || "",
      downtimeStart: formatDate(client.downtimeStart),
      openTime: formatDate(client.openTimeHPSM),
      refHPSM: client.refHPSM || "",
      problemStatus: client.problemStatus || "",
      closeTime: formatDate(client.closeTime),
      resolutionCode: client.resolutionCode || "",
      region: client.region || "",
      offre: client.offre || "",
      briefDescription: client.briefDescription || "",
      debitADSL: client.debitADSL || "",
      fsiADSL: client.fsiadsl || "",
      productType: client.productType || "",
      resolutionObservation: client.resolutionObservation || "",
      ttResolutionDuration: client.resolutionDuration || "",
      actionFSI: client.actionFSI || "",
    };

    return NextResponse.json({
      found: true,
      data: result,
      actionAlreadyFilled: Boolean(client.actionFSI?.trim()),
    });
  } catch (error) {
    console.error("Error reading line from database:", error);
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: PRODUCTION_DATABASE_ERROR_MESSAGE },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dlNumber, actionFSI } = body;

    if (!dlNumber || !actionFSI) {
      return NextResponse.json({ error: "DL number and action are required" }, { status: 400 });
    }

    const normalizedDLigne = String(dlNumber).trim();
    const normalizedAction = String(actionFSI).trim();

    const existingClient = await prisma.client.findUnique({
      where: { dLigne: normalizedDLigne },
      select: { id: true },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Ligne not found" }, { status: 404 });
    }

    await prisma.client.update({
      where: { dLigne: normalizedDLigne },
      data: { actionFSI: normalizedAction },
    });

    return NextResponse.json({ success: true, message: "Action saved successfully" });
  } catch (error) {
    console.error("Error writing line action to database:", error);
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(
        { error: PRODUCTION_DATABASE_ERROR_MESSAGE },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
  }
}

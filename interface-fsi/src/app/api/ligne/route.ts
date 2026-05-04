import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isDatabaseUnavailableError,
  PRODUCTION_DATABASE_ERROR_MESSAGE,
} from "@/lib/runtime";
import { FSI_ADSL_OPTIONS, OFFER_OPTIONS } from "@/lib/firstTimeOptions";
import { loadDebitAdslOptions } from "@/lib/debitOptions";

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

interface FirstTimeDetailsInput {
  downtimeStart: string;
  region: string;
  offre: string;
  briefDescription: string;
  debitADSL: string;
  fsiADSL: string;
}

const REGION_OPTIONS = new Set([
  "ARIANA",
  "BEJA",
  "BENAROUS",
  "BIZERTE",
  "GABES",
  "GAFSA",
  "JENDOUBA",
  "KAIROUAN",
  "KASSERINE",
  "KEBILI",
  "KEF",
  "MAHDIA",
  "MANNOUBA",
  "MEDENINE",
  "MONASTIR",
  "NABEUL",
  "SFAX",
  "SIDIBOUZID",
  "SILIANA",
  "SOUSSE",
  "TATAOUINE",
  "TOZEUR",
  "TUNIS",
  "ZAGHOUAN",
]);

const OFFER_OPTIONS_SET = new Set(OFFER_OPTIONS.map((option) => option.toLowerCase()));
const FSI_OPTIONS_SET = new Set(FSI_ADSL_OPTIONS.map((option) => option.toLowerCase()));

function formatDate(value: Date | null | undefined) {
  return value ? value.toString() : "";
}

function inferTypeClient(offre: string) {
  const normalizedOffre = offre.toLowerCase();
  if (
    normalizedOffre.includes("pro") ||
    normalizedOffre.includes("business") ||
    normalizedOffre.includes("vdsl")
  ) {
    return "Professionnel";
  }
  return "Résidentiel";
}

function formatTunisiaDayPrefix(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Tunis",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}.${get("month")}.${get("day")}`;
}

async function generateReferenceExtranet(tx: Prisma.TransactionClient, now: Date) {
  const dayPrefix = formatTunisiaDayPrefix(now);
  const existingRefs = await tx.client.findMany({
    where: {
      referenceExtranet: {
        startsWith: `${dayPrefix}.`,
      },
    },
    select: {
      referenceExtranet: true,
    },
  });

  const currentMax = existingRefs.reduce((max, item) => {
    const value = item.referenceExtranet ?? "";
    const suffix = value.split(".").at(-1);
    const parsed = Number.parseInt(String(suffix), 10);
    if (Number.isNaN(parsed)) {
      return max;
    }
    return Math.max(max, parsed);
  }, 0);

  const nextSequence = String(currentMax + 1).padStart(2, "0");
  return `${dayPrefix}.${nextSequence}`;
}

async function generateRefHPSM(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const randomNumber = Math.floor(10_000_000 + Math.random() * 90_000_000);
    const candidate = `IM${randomNumber}`;
    const exists = await tx.client.findFirst({
      where: { refHPSM: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  throw new Error("Unable to generate unique Ref HPSM");
}

function parseDowntimeStart(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
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
    const dlNumber = String(body.dlNumber ?? "").trim();
    const actionFSI = String(body.actionFSI ?? "").trim();
    const testOutcome = body.testOutcome === "pass" ? "pass" : body.testOutcome === "fail" ? "fail" : null;
    const isFirstTime = body.isFirstTime === true;
    const firstTimeDetails = (body.firstTimeDetails ?? null) as FirstTimeDetailsInput | null;

    if (!dlNumber || !actionFSI || !testOutcome) {
      return NextResponse.json(
        { error: "DL number, action FSI, and test outcome are required" },
        { status: 400 },
      );
    }

    const normalizedDLigne = dlNumber;
    const normalizedAction = actionFSI;
    const now = new Date();
    // FSI tests alone must never auto-close a ticket without intervention.
    const nextProblemStatus = "Traitement";
    const closeTime = null;

    const existingClient = await prisma.client.findUnique({
      where: { dLigne: normalizedDLigne },
      select: { id: true, nom: true, referenceExtranet: true, refHPSM: true, downtimeStart: true },
    });

    if (!existingClient && !isFirstTime) {
      return NextResponse.json({ error: "Ligne not found for non-first-time flow" }, { status: 404 });
    }

    if (isFirstTime) {
      if (!firstTimeDetails) {
        return NextResponse.json({ error: "First-time details are required" }, { status: 400 });
      }

      const normalizedRegion = String(firstTimeDetails.region ?? "").trim().toUpperCase();
      const normalizedOffre = String(firstTimeDetails.offre ?? "").trim();
      const normalizedBrief = String(firstTimeDetails.briefDescription ?? "").trim();
      const normalizedDebit = String(firstTimeDetails.debitADSL ?? "").trim();
      const normalizedFSI = String(firstTimeDetails.fsiADSL ?? "").trim();
      const parsedDowntime = parseDowntimeStart(String(firstTimeDetails.downtimeStart ?? "").trim());

      if (
        !parsedDowntime ||
        !normalizedRegion ||
        !normalizedOffre ||
        !normalizedBrief ||
        !normalizedDebit ||
        !normalizedFSI
      ) {
        return NextResponse.json(
          { error: "All first-time detail fields are required and downtime must be a valid date" },
          { status: 400 },
        );
      }

      if (!REGION_OPTIONS.has(normalizedRegion)) {
        return NextResponse.json({ error: "Region must be one of the 24 Tunisian regions" }, { status: 400 });
      }

      if (!OFFER_OPTIONS_SET.has(normalizedOffre.toLowerCase())) {
        return NextResponse.json(
          { error: "Offre must be one of the configured offer options" },
          { status: 400 },
        );
      }

      if (!FSI_OPTIONS_SET.has(normalizedFSI.toLowerCase())) {
        return NextResponse.json(
          { error: "FSIADSL must be Hexabyte, Topnet, or Globalnet" },
          { status: 400 },
        );
      }

      const { options: debitOptions } = await loadDebitAdslOptions();
      if (
        debitOptions.length > 0 &&
        !debitOptions.some((option) => option.toLowerCase() === normalizedDebit.toLowerCase())
      ) {
        return NextResponse.json(
          { error: "DebitADSL must be selected from all-data.xlsx values" },
          { status: 400 },
        );
      }

      const saved = await prisma.$transaction(async (tx) => {
        if (existingClient) {
          return tx.client.update({
            where: { dLigne: normalizedDLigne },
            data: {
              actionFSI: normalizedAction,
              problemStatus: nextProblemStatus,
              closeTime,
              region: normalizedRegion,
              offre: normalizedOffre,
              briefDescription: normalizedBrief,
              debitADSL: normalizedDebit,
              fsiadsl: normalizedFSI,
              downtimeStart: parsedDowntime,
              openTimeHPSM: parsedDowntime,
            },
          });
        }

        const referenceExtranet = await generateReferenceExtranet(tx, now);
        const refHPSM = await generateRefHPSM(tx);

        return tx.client.create({
          data: {
            dLigne: normalizedDLigne,
            nom: `Client ${normalizedDLigne}`,
            referenceExtranet,
            refHPSM,
            downtimeStart: parsedDowntime,
            openTimeHPSM: parsedDowntime,
            problemStatus: nextProblemStatus,
            closeTime,
            region: normalizedRegion,
            offre: normalizedOffre,
            briefDescription: normalizedBrief,
            debitADSL: normalizedDebit,
            fsiadsl: normalizedFSI,
            typeClient: inferTypeClient(normalizedOffre),
            actionFSI: normalizedAction,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "First-time ticket created and dispatched successfully",
        status: saved.problemStatus,
        created: !existingClient,
        handoffToAgentTT: true,
      });
    }

    const saved = await prisma.client.update({
      where: { dLigne: normalizedDLigne },
      data: {
        actionFSI: normalizedAction,
        problemStatus: nextProblemStatus,
        closeTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Action saved and routed to Interface Agent TT",
      status: saved.problemStatus,
      handoffToAgentTT: true,
    });
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

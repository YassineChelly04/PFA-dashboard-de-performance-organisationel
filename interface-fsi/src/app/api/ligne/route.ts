import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const EXCEL_PATH = path.join(process.cwd(), '..', 'database', 'data.xlsx');

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

// GET: Search for a ligne by DL number
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dlNumber = searchParams.get('dl');

  if (!dlNumber) {
    return NextResponse.json({ error: 'DL number is required' }, { status: 400 });
  }

  try {
    if (!fs.existsSync(EXCEL_PATH)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

    // Find the ligne by DL number
    const ligne = data.find((row) => {
      const dlValue = String(row['DLigne'] || '').trim().toUpperCase();
      return dlValue === dlNumber.trim().toUpperCase();
    });

    if (!ligne) {
      return NextResponse.json({ error: 'Ligne not found', found: false }, { status: 404 });
    }

    const actionColumn = 'action faite par FSI meme avant d\'entrer de saisir un eréclamation sur extranet';
    const actionValue = String(ligne[actionColumn] || '').trim();

    const result: LigneData = {
      dLigne: String(ligne['DLigne'] || ''),
      referenceExtranet: String(ligne['reference_no Extranet'] || ''),
      downtimeStart: String(ligne['downtime_start (Extranet)'] || ''),
      openTime: String(ligne['open_time (HPSM)'] || ''),
      refHPSM: String(ligne['Ref HPSM'] || ''),
      problemStatus: String(ligne['problem_status'] || ''),
      closeTime: String(ligne['close_time'] || ''),
      resolutionCode: String(ligne['resolution_code'] || ''),
      region: String(ligne['Region'] || ''),
      offre: String(ligne['Offre'] || ''),
      briefDescription: String(ligne['brief_description'] || ''),
      debitADSL: String(ligne['DebitADSL'] || ''),
      fsiADSL: String(ligne['FSIADSL'] || ''),
      productType: String(ligne['product_type'] || ''),
      resolutionObservation: String(ligne['resolution observation TT'] || ''),
      ttResolutionDuration: String(ligne['TT_resolution_duration'] || ''),
      actionFSI: actionValue,
    };

    return NextResponse.json({
      found: true,
      data: result,
      actionAlreadyFilled: actionValue.length > 0,
    });
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}

// POST: Save action FSI for a ligne
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dlNumber, actionFSI } = body;

    if (!dlNumber || !actionFSI) {
      return NextResponse.json({ error: 'DL number and action are required' }, { status: 400 });
    }

    if (!fs.existsSync(EXCEL_PATH)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

    // Find the row index
    const rowIndex = data.findIndex((row) => {
      const dlValue = String(row['DLigne'] || '').trim().toUpperCase();
      return dlValue === dlNumber.trim().toUpperCase();
    });

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Ligne not found' }, { status: 404 });
    }

    // Update the action column
    const actionColumn = 'action faite par FSI meme avant d\'entrer de saisir un eréclamation sur extranet';
    data[rowIndex][actionColumn] = actionFSI;

    // Convert back to sheet and save
    const newSheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, EXCEL_PATH);

    return NextResponse.json({ success: true, message: 'Action saved successfully' });
  } catch (error) {
    console.error('Error writing to Excel file:', error);
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}

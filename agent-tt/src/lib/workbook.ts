import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'
import type { Prisma } from '@prisma/client'

type WorkbookRow = Record<string, unknown>

const DEFAULT_WORKBOOK_PATH = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  'data',
  'all-data.xlsx'
)

function resolveWorkbookPath() {
  const envPath = process.env.WORKBOOK_PATH?.trim()
  if (envPath) {
    return path.resolve(envPath)
  }

  return DEFAULT_WORKBOOK_PATH
}

export const WORKBOOK_PATH = resolveWorkbookPath()
export const ACTION_FSI_COLUMN =
  "action faite par FSI meme avant d'entrer de saisir un eréclamation sur extranet"

const COLUMN = {
  dLigne: 'DLigne',
  referenceExtranet: 'reference_no Extranet',
  downtimeStart: 'downtime_start (Extranet)',
  openTimeHPSM: 'open_time (HPSM)',
  refHPSM: 'Ref HPSM',
  problemStatus: 'problem_status',
  closeTime: 'close_time',
  resolutionCode: 'resolution_code',
  region: 'Region',
  offre: 'Offre',
  briefDescription: 'brief_description',
  debitADSL: 'DebitADSL',
  fsiadsl: 'FSIADSL',
  productType: 'product_type',
  resolutionObservation: 'resolution observation TT',
  resolutionDuration: 'TT_resolution_duration',
  actionFSI: ACTION_FSI_COLUMN,
} as const

export interface WorkbookInterventionUpdate {
  closeTime?: Date
  problemStatus?: string
  resolutionCode?: string
  productType?: string
  resolutionObservation?: string
  resolutionDuration?: string
}

function normalize(value: unknown) {
  return String(value ?? '').trim()
}

function ensureWorkbookExists() {
  if (!fs.existsSync(WORKBOOK_PATH)) {
    throw new Error(`Workbook not found at ${WORKBOOK_PATH}`)
  }
}

function readWorkbook() {
  ensureWorkbookExists()
  const file = fs.readFileSync(WORKBOOK_PATH)
  return XLSX.read(file, { type: 'buffer', cellDates: true })
}

function getRows(workbook: XLSX.WorkBook) {
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  return {
    sheetName,
    rows: XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: true,
    }) as WorkbookRow[],
  }
}

function excelValueToDate(value: unknown) {
  if (!value) {
    return null
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) {
      return null
    }

    return new Date(
      parsed.y,
      parsed.m - 1,
      parsed.d,
      parsed.H,
      parsed.M,
      parsed.S
    )
  }

  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getRowTimestamp(row: WorkbookRow) {
  const candidates = [
    row[COLUMN.closeTime],
    row[COLUMN.openTimeHPSM],
    row[COLUMN.downtimeStart],
  ]

  for (const candidate of candidates) {
    const date = excelValueToDate(candidate)
    if (date) {
      return date.getTime()
    }
  }

  return 0
}

function isClosedRow(row: WorkbookRow) {
  return normalize(row[COLUMN.problemStatus]).toLowerCase() === 'clôturé'
}

function pickBestRow(rows: WorkbookRow[]) {
  return rows.sort((left, right) => {
    const leftClosed = isClosedRow(left) ? 1 : 0
    const rightClosed = isClosedRow(right) ? 1 : 0

    if (leftClosed !== rightClosed) {
      return leftClosed - rightClosed
    }

    return getRowTimestamp(right) - getRowTimestamp(left)
  })[0] ?? null
}

function findRowIndex(rows: WorkbookRow[], predicate: (row: WorkbookRow) => boolean) {
  const matches = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => predicate(row))
    .sort((left, right) => {
      const leftClosed = isClosedRow(left.row) ? 1 : 0
      const rightClosed = isClosedRow(right.row) ? 1 : 0

      if (leftClosed !== rightClosed) {
        return leftClosed - rightClosed
      }

      return getRowTimestamp(right.row) - getRowTimestamp(left.row)
    })

  return matches[0]?.index ?? -1
}

function inferTypeClient(offre: string) {
  const normalizedOffre = offre.toLowerCase()

  if (
    normalizedOffre.includes('pro') ||
    normalizedOffre.includes('business') ||
    normalizedOffre.includes('vdsl')
  ) {
    return 'Professionnel'
  }

  return 'Résidentiel'
}

function buildClientName(dLigne: string) {
  return `Client ${dLigne}`
}

export function findWorkbookRowByLookup(query: string) {
  const normalizedQuery = normalize(query).toUpperCase()
  if (!normalizedQuery) {
    return null
  }

  const { rows } = getRows(readWorkbook())

  const matches = rows.filter((row) => {
    const candidates = [
      row[COLUMN.dLigne],
      row[COLUMN.referenceExtranet],
      row[COLUMN.refHPSM],
    ]

    return candidates.some(
      (candidate) => normalize(candidate).toUpperCase() === normalizedQuery
    )
  })

  return pickBestRow(matches)
}

export function findWorkbookRowByDLigne(dLigne: string) {
  const normalizedDLigne = normalize(dLigne).toUpperCase()
  if (!normalizedDLigne) {
    return null
  }

  const { rows } = getRows(readWorkbook())
  return pickBestRow(
    rows.filter(
      (row) => normalize(row[COLUMN.dLigne]).toUpperCase() === normalizedDLigne
    )
  )
}

export function mapWorkbookRowToClientInput(
  row: WorkbookRow
): Prisma.ClientUncheckedCreateInput | null {
  const dLigne = normalize(row[COLUMN.dLigne])
  if (!dLigne) {
    return null
  }

  const offre = normalize(row[COLUMN.offre])

  return {
    dLigne,
    referenceExtranet: normalize(row[COLUMN.referenceExtranet]) || null,
    refHPSM: normalize(row[COLUMN.refHPSM]) || null,
    nom: buildClientName(dLigne),
    region: normalize(row[COLUMN.region]) || 'Non spécifiée',
    offre: offre || 'Offre non spécifiée',
    debitADSL: normalize(row[COLUMN.debitADSL]) || 'Non spécifié',
    fsiadsl: normalize(row[COLUMN.fsiadsl]) || 'Non spécifié',
    typeClient: inferTypeClient(offre),
    downtimeStart: excelValueToDate(row[COLUMN.downtimeStart]),
    openTimeHPSM: excelValueToDate(row[COLUMN.openTimeHPSM]),
    problemStatus: normalize(row[COLUMN.problemStatus]) || 'Ouvert',
    closeTime: excelValueToDate(row[COLUMN.closeTime]),
    briefDescription: normalize(row[COLUMN.briefDescription]) || null,
    actionFSI: normalize(row[COLUMN.actionFSI]) || null,
    resolutionCode: normalize(row[COLUMN.resolutionCode]) || null,
    productType: normalize(row[COLUMN.productType]) || null,
    resolutionObservation: normalize(row[COLUMN.resolutionObservation]) || null,
    resolutionDuration: normalize(row[COLUMN.resolutionDuration]) || null,
    attenuationLigne: null,
  }
}

export function getWorkbookClientInputs() {
  const { rows } = getRows(readWorkbook())

  return rows
    .map((row) => mapWorkbookRowToClientInput(row))
    .filter(
      (client): client is Prisma.ClientUncheckedCreateInput => client !== null
    )
}

export function updateWorkbookIntervention(
  dLigne: string,
  updates: WorkbookInterventionUpdate
) {
  const workbook = readWorkbook()
  const { sheetName, rows } = getRows(workbook)
  const normalizedDLigne = normalize(dLigne).toUpperCase()

  const rowIndex = findRowIndex(
    rows,
    (row) => normalize(row[COLUMN.dLigne]).toUpperCase() === normalizedDLigne
  )

  if (rowIndex === -1) {
    return false
  }

  const row = rows[rowIndex]

  if (updates.problemStatus) {
    row[COLUMN.problemStatus] = updates.problemStatus
  }
  if (updates.closeTime) {
    row[COLUMN.closeTime] = updates.closeTime
  }
  if (updates.resolutionCode) {
    row[COLUMN.resolutionCode] = updates.resolutionCode
  }
  if (updates.productType) {
    row[COLUMN.productType] = updates.productType
  }
  if (updates.resolutionObservation) {
    row[COLUMN.resolutionObservation] = updates.resolutionObservation
  }
  if (updates.resolutionDuration) {
    row[COLUMN.resolutionDuration] = updates.resolutionDuration
  }

  workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows)
  const output = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  fs.writeFileSync(WORKBOOK_PATH, output)

  return true
}

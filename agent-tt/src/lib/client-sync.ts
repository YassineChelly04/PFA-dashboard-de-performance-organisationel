import { prisma } from '@/lib/prisma'
import {
  getWorkbookClientInputs,
} from '@/lib/workbook'

export interface WorkbookSyncSummary {
  created: number
  updated: number
  skipped: number
  total: number
}

export async function syncAllClientsFromWorkbook(): Promise<WorkbookSyncSummary> {
  const clients = getWorkbookClientInputs()
  const existingClients = await prisma.client.findMany({
    select: { dLigne: true },
  })
  const existingDLignes = new Set(existingClients.map((client) => client.dLigne))

  let created = 0
  let updated = 0
  let skipped = 0

  for (const clientInput of clients) {
    if (!clientInput.dLigne) {
      skipped += 1
      continue
    }

    const alreadyExists = existingDLignes.has(clientInput.dLigne)
    await prisma.client.upsert({
      where: { dLigne: clientInput.dLigne },
      update: clientInput,
      create: clientInput,
    })

    if (alreadyExists) {
      updated += 1
    } else {
      created += 1
      existingDLignes.add(clientInput.dLigne)
    }
  }

  return {
    created,
    updated,
    skipped,
    total: clients.length,
  }
}

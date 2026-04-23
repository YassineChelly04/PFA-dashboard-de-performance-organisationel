import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canUseWorkbookRuntimeFallback } from '@/lib/runtime'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    let client = await prisma.client.findFirst({
      where: {
        OR: [
          { dLigne: { contains: query } },
          { referenceExtranet: { contains: query } },
          { refHPSM: { contains: query } },
        ],
      },
      include: {
        interventions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!client && canUseWorkbookRuntimeFallback()) {
      const { findWorkbookRowByLookup, mapWorkbookRowToClientInput } = await import(
        '@/lib/workbook'
      )
      const workbookRow = findWorkbookRowByLookup(query)
      if (workbookRow) {
        const workbookClient = mapWorkbookRowToClientInput(workbookRow)
        if (workbookClient) {
          await prisma.client.upsert({
            where: { dLigne: workbookClient.dLigne },
            update: workbookClient,
            create: workbookClient,
          })

          client = await prisma.client.findFirst({
            where: {
              OR: [
                { dLigne: { contains: query } },
                { referenceExtranet: { contains: query } },
                { refHPSM: { contains: query } },
              ],
            },
            include: {
              interventions: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
          })
        }
      }
    }

    if (!client) {
      return NextResponse.json({ client: null })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

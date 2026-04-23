import { NextResponse } from 'next/server'
import { canUseWorkbookRuntimeFallback } from '@/lib/runtime'

export async function POST() {
  if (!canUseWorkbookRuntimeFallback()) {
    return NextResponse.json(
      {
        error:
          'Workbook sync is disabled on Vercel deployments. Use the database as the production source of truth.',
      },
      { status: 503 }
    )
  }

  try {
    const { syncAllClientsFromWorkbook } = await import('@/lib/client-sync')
    const summary = await syncAllClientsFromWorkbook()
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error syncing workbook to database:', error)
    return NextResponse.json(
      { error: 'Failed to synchronize workbook to database' },
      { status: 500 }
    )
  }
}

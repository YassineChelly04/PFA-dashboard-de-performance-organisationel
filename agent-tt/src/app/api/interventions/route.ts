import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { canUseWorkbookRuntimeFallback } from '@/lib/runtime'

function formatResolutionDuration(openTime: Date, closeTime: Date) {
  const durationInSeconds = Math.max(
    0,
    Math.floor((closeTime.getTime() - openTime.getTime()) / 1000)
  )
  const days = Math.floor(durationInSeconds / 86400)
  const hours = Math.floor((durationInSeconds % 86400) / 3600)
  const minutes = Math.floor((durationInSeconds % 3600) / 60)
  const seconds = durationInSeconds % 60

  return `${days} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, technicienId: requestTechnicienId, productType, resolutionCode, resolutionObservation } = body
    const session = await getServerSession(authOptions)
    const sessionTechnicienId = session?.user?.id

    const normalizedObservation = String(resolutionObservation ?? '').trim()
    const normalizedProductType = String(productType ?? '').trim()
    const normalizedResolutionCode = String(resolutionCode ?? '').trim()

    const effectiveTechnicienId = String(sessionTechnicienId ?? requestTechnicienId ?? '').trim()

    if (!clientId || !effectiveTechnicienId || !normalizedObservation) {
      return NextResponse.json(
        { error: 'Authentification invalide ou expirée. Veuillez vous reconnecter.' },
        { status: 401 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { dLigne: true, openTimeHPSM: true, downtimeStart: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const closeTime = new Date()
    const openTime = client.openTimeHPSM ?? client.downtimeStart
    const resolutionDuration = openTime
      ? formatResolutionDuration(openTime, closeTime)
      : null

    if (canUseWorkbookRuntimeFallback()) {
      const { updateWorkbookIntervention } = await import('@/lib/workbook')
      const workbookUpdated = updateWorkbookIntervention(client.dLigne, {
        problemStatus: 'Clôturé',
        closeTime,
        resolutionCode: normalizedResolutionCode || undefined,
        productType: normalizedProductType || undefined,
        resolutionObservation: normalizedObservation,
        resolutionDuration: resolutionDuration || undefined,
      })

      if (!workbookUpdated) {
        return NextResponse.json(
          { error: 'Unable to update the local workbook for this ligne' },
          { status: 409 }
        )
      }
    }

    const intervention = await prisma.$transaction(async (tx) => {
      const createdIntervention = await tx.intervention.create({
        data: {
          clientId,
          technicienId: effectiveTechnicienId,
          productType: normalizedProductType || null,
          resolutionCode: normalizedResolutionCode || null,
          resolutionObservation: normalizedObservation,
          resolutionDuration,
          status: 'Terminé',
          closeTime,
        },
      })

      await tx.client.update({
        where: { id: clientId },
        data: {
          problemStatus: 'Clôturé',
          closeTime,
          resolutionCode: normalizedResolutionCode || null,
          productType: normalizedProductType || null,
          resolutionObservation: normalizedObservation,
          resolutionDuration,
        },
      })

      return createdIntervention
    })

    return NextResponse.json({ intervention })
  } catch (error) {
    console.error('Error creating intervention:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  try {
    const where = clientId ? { clientId } : {}
    
    const interventions = await prisma.intervention.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            nom: true,
            dLigne: true,
            offre: true,
            referenceExtranet: true,
            refHPSM: true,
            openTimeHPSM: true,
            downtimeStart: true,
            closeTime: true,
            resolutionCode: true,
            productType: true,
            resolutionObservation: true,
            resolutionDuration: true,
            problemStatus: true,
          },
        },
        technicien: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    })

    return NextResponse.json({ interventions })
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

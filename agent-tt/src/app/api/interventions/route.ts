import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateWorkbookIntervention } from '@/lib/workbook'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientId, technicienId, productType, resolutionCode, resolutionObservation } = body

    if (!clientId || !technicienId || !productType || !resolutionCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { dLigne: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const closeTime = new Date()

    const workbookUpdated = updateWorkbookIntervention(client.dLigne, {
      problemStatus: 'Clôturé',
      closeTime,
      resolutionCode,
      productType,
      resolutionObservation,
    })

    if (!workbookUpdated) {
      return NextResponse.json(
        { error: 'Unable to update all-data.xlsx for this ligne' },
        { status: 409 }
      )
    }

    const intervention = await prisma.$transaction(async (tx) => {
      const createdIntervention = await tx.intervention.create({
        data: {
          clientId,
          technicienId,
          productType,
          resolutionCode,
          resolutionObservation,
          status: 'Terminé',
          closeTime,
        },
      })

      await tx.client.update({
        where: { id: clientId },
        data: {
          problemStatus: 'Clôturé',
          closeTime,
          resolutionCode,
          productType,
          resolutionObservation: resolutionObservation || null,
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

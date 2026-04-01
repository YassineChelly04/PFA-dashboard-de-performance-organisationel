import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Create intervention
    const intervention = await prisma.intervention.create({
      data: {
        clientId,
        technicienId,
        productType,
        resolutionCode,
        resolutionObservation,
        status: 'Terminé',
        closeTime: new Date(),
      },
    })

    // Update client status
    await prisma.client.update({
      where: { id: clientId },
      data: { problemStatus: 'Clôturé' },
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

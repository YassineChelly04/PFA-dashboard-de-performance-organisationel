import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const existingClient = await prisma.client.findUnique({
      where: { id },
      select: { dLigne: true },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        interventions: {
          orderBy: { createdAt: 'desc' },
          include: {
            technicien: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

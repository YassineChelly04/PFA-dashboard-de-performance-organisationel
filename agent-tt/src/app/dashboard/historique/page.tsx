import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { HistoriquePage } from './HistoriquePage'

type HistoriqueIntervention = Prisma.InterventionGetPayload<{
  include: {
    client: {
      select: {
        nom: true
        dLigne: true
        offre: true
        referenceExtranet: true
        refHPSM: true
        openTimeHPSM: true
        downtimeStart: true
        closeTime: true
        resolutionCode: true
        productType: true
        resolutionObservation: true
        resolutionDuration: true
        problemStatus: true
      }
    }
    technicien: {
      select: {
        nom: true
        prenom: true
      }
    }
  }
}>

export default async function Page() {
  let interventions: HistoriqueIntervention[] = []

  try {
    interventions = await prisma.intervention.findMany({
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
  } catch (error) {
    console.error('Error fetching historique interventions:', error)
  }

  return <HistoriquePage interventions={interventions} client={null} />
}

import { prisma } from '@/lib/prisma'
import { HistoriquePage } from './HistoriquePage'

export default async function Page() {
  const interventions = await prisma.intervention.findMany({
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

  return <HistoriquePage interventions={interventions} client={null} />
}

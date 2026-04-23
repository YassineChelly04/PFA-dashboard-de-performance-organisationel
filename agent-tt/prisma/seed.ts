import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getWorkbookClientInputs } from '../src/lib/workbook'

const prisma = new PrismaClient()
const CHUNK_SIZE = 1000

async function main() {
  console.log('🌱 Seeding database...')

  // Créer un technicien de test
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const technicien = await prisma.technicien.upsert({
    where: { employeeId: '88234' },
    update: {},
    create: {
      employeeId: '88234',
      password: hashedPassword,
      nom: 'Ben Ali',
      prenom: 'Mohamed',
      email: 'mohamed.benali@tunisietelecom.tn',
    },
  })

  console.log('✅ Technicien créé:', technicien.prenom, technicien.nom)

  const clients = getWorkbookClientInputs()
  const uniqueByDLigne = new Map<string, (typeof clients)[number]>()
  for (const clientData of clients) {
    uniqueByDLigne.set(clientData.dLigne, clientData)
  }

  const uniqueClients = Array.from(uniqueByDLigne.values())
  let created = 0

  for (let index = 0; index < uniqueClients.length; index += CHUNK_SIZE) {
    const chunk = uniqueClients.slice(index, index + CHUNK_SIZE)
    const result = await prisma.client.createMany({
      data: chunk,
      skipDuplicates: true,
    })
    created += result.count
    console.log(
      `✅ ${Math.min(index + CHUNK_SIZE, uniqueClients.length)}/${uniqueClients.length} clients synchronisés`
    )
  }

  const alreadyPresent = uniqueClients.length - created
  console.log(
    `🎉 Seeding terminé! ${uniqueClients.length} clients uniques depuis all-data.xlsx (${created} créés, ${alreadyPresent} déjà présents)`
  )
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { AlertCircle, ArrowRight, Clock3, ListChecks } from 'lucide-react'

function formatDate(value: Date | null) {
  if (!value) {
    return '—'
  }

  return value.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function QueuePage() {
  const queueItems = await prisma.client.findMany({
    where: {
      OR: [
        { problemStatus: 'Traitement' },
        { problemStatus: 'Ouvert / Traitement' },
        { problemStatus: { contains: 'traitement', mode: 'insensitive' } },
      ],
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      dLigne: true,
      nom: true,
      region: true,
      offre: true,
      debitADSL: true,
      fsiadsl: true,
      briefDescription: true,
      referenceExtranet: true,
      refHPSM: true,
      problemStatus: true,
      downtimeStart: true,
      updatedAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto w-full max-w-[1240px] space-y-5">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <ListChecks size={14} />
                FILE D&apos;ATTENTE FSI
              </div>
              <h1 className="mt-3 font-[family-name:var(--font-montserrat)] text-2xl font-bold text-[#1f2f9a] sm:text-3xl">
                Tickets en Traitement
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Réclamations échouées aux tests fournisseur, prêtes pour intervention Agent TT.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
              <div className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#1f2f9a]">
                {queueItems.length}
              </div>
              <div className="text-xs uppercase tracking-wide text-slate-500">En attente</div>
            </div>
          </div>
        </section>

        {queueItems.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ListChecks size={30} />
            </div>
            <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-semibold text-slate-900">
              Aucune réclamation en traitement
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              La file est vide. Les nouveaux tickets en échec de test apparaîtront ici automatiquement.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            {queueItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {item.problemStatus}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {item.dLigne}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {item.region}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-semibold text-slate-900">
                        {item.nom}
                      </h2>
                      <p className="text-sm text-slate-500">
                        Offre: {item.offre} | Débit: {item.debitADSL} | FSI: {item.fsiadsl}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>Ref Extranet: {item.referenceExtranet || '—'}</p>
                      <p>Ref HPSM: {item.refHPSM || '—'}</p>
                      <p>Downtime: {formatDate(item.downtimeStart)}</p>
                      <p>Maj: {formatDate(item.updatedAt)}</p>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{item.briefDescription || 'Aucune description fournie.'}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/client/${item.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1f2f9a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a2783]"
                  >
                    Ouvrir ticket
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 size={14} />
            Les tickets sont classés par dernière mise à jour.
          </div>
        </section>
      </div>
    </div>
  )
}

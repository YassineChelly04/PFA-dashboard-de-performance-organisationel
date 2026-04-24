'use client'

import Link from 'next/link'
import { Wrench, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Intervention {
  id: string
  productType: string | null
  resolutionCode: string | null
  status: string
  createdAt: Date
  client: {
    nom: string
    dLigne: string
    offre: string
    problemStatus: string
  }
}

interface Props {
  interventions: Intervention[]
}

export function InterventionsPage({ interventions }: Props) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const pending = interventions.filter(i => i.status === 'En cours')
  const completed = interventions.filter(i => i.status === 'Terminé')

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">

      <div className="flex-1 px-4 lg:px-[20%] py-6">
        <div className="w-full space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-slate-900">{interventions.length}</p>
              <p className="font-[family-name:var(--font-manrope)] text-xs text-slate-500">Total</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 shadow-sm text-center">
              <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-amber-600">{pending.length}</p>
              <p className="font-[family-name:var(--font-manrope)] text-xs text-amber-700">En cours</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 shadow-sm text-center">
              <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-emerald-600">{completed.length}</p>
              <p className="font-[family-name:var(--font-manrope)] text-xs text-emerald-700">Terminées</p>
            </div>
          </div>

          {/* Pending Section */}
          {pending.length > 0 && (
            <div>
              <h3 className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <Clock size={16} />
                EN COURS ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map((intervention) => (
                  <Link
                    key={intervention.id}
                    href={`/dashboard/client/${intervention.client.dLigne}`}
                    className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                         <h4 className="font-[family-name:var(--font-montserrat)] font-semibold text-slate-900">
                           {intervention.client.nom}
                         </h4>
                         <p className="font-[family-name:var(--font-manrope)] text-sm text-slate-500">
                           {intervention.client.dLigne}
                         </p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        En cours
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {formatDate(intervention.createdAt)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <div>
              <h3 className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <CheckCircle size={16} />
                TERMINÉES ({completed.length})
              </h3>
              <div className="space-y-3">
                {completed.slice(0, 10).map((intervention) => (
                  <div
                    key={intervention.id}
                    className="bg-white rounded-xl p-4 shadow-sm opacity-75"
                  >
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                         <h4 className="font-[family-name:var(--font-montserrat)] font-semibold text-slate-900">
                           {intervention.client.nom}
                         </h4>
                         <p className="font-[family-name:var(--font-manrope)] text-sm text-slate-500">
                           {intervention.resolutionCode || 'Non spécifié'}
                         </p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        Terminé
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={14} />
                      {formatDate(intervention.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {interventions.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="text-slate-400" size={32} />
              </div>
              <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-semibold text-slate-900 mb-2">
                Aucune intervention
              </h3>
              <p className="font-[family-name:var(--font-manrope)] text-slate-500 mb-4">
                Vous n&apos;avez pas encore d&apos;interventions assignées.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                Rechercher un client
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

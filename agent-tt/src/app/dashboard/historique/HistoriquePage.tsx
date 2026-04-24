"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, CheckSquare, CheckCircle, TrendingUp, SlidersHorizontal, Search, Ban, User } from 'lucide-react'

interface Intervention {
  id: string
  productType: string | null
  resolutionCode: string | null
  resolutionObservation: string | null
  status: string
  createdAt: Date
  client: {
    nom: string
    dLigne: string
    offre: string
  }
  technicien: {
    nom: string
    prenom: string
  }
}

interface Props {
  interventions: Intervention[]
  client: { nom: string; dLigne: string } | null
}

export function HistoriquePage({ interventions, client }: Props) {
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<{ nom: string; dLigne: string } | null>(client)
  const [selectedInterventions, setSelectedInterventions] = useState<Intervention[]>(interventions)

  useEffect(() => {
    const storedClientId = localStorage.getItem('selectedClientId')
    setSelectedClientId(storedClientId)
  }, [])

  useEffect(() => {
    async function loadSelectedClient() {
      if (!selectedClientId) {
        setSelectedClient(null)
        setSelectedInterventions(interventions)
        return
      }

      const response = await fetch(`/api/clients/${selectedClientId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedClient({
          nom: data.client.nom,
          dLigne: data.client.dLigne,
        })
        setSelectedInterventions(interventions.filter(intervention => intervention.client.dLigne === data.client.dLigne))
      } else {
        setSelectedClient(null)
        setSelectedInterventions(interventions)
      }
    }

    loadSelectedClient()
  }, [selectedClientId, interventions])
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalInterventions = selectedInterventions.length
  const terminées = selectedInterventions.filter(i => i.status === 'Terminé').length
  const tauxCompletion = totalInterventions > 0 ? Math.round((terminées / totalInterventions) * 100) : 0

  const titleClient = selectedClient

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Header section */}
      <div className="px-4 lg:px-[20%] pt-6 pb-4">
        <div className="w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-indigo-900 mb-2">
                Historique
              </h1>
              {titleClient ? (
                <>
                  <p className="font-[family-name:var(--font-manrope)] text-xl md:text-2xl font-semibold text-slate-600">
                    de {titleClient.nom}
                  </p>
                  <p className="font-[family-name:var(--font-manrope)] text-base md:text-lg text-slate-500">
                    {titleClient.dLigne}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-[family-name:var(--font-manrope)] text-xl md:text-2xl font-semibold text-slate-600">
                    Veuillez choisir une ligne
                  </p>
                </>
              )}
            </div>
            
            {/* Filter button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <SlidersHorizontal size={16} />
              <span className="font-[family-name:var(--font-montserrat)] text-sm font-medium">Filtrer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-[20%] pb-6">
        <div className="w-full space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total interventions card */}
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 border-l-4 border-[#2D44B8]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-[family-name:var(--font-manrope)] text-[20px] text-[#454652] mb-2">
                    Total interventions
                  </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-5xl sm:text-[71px] font-bold leading-none text-[#2D44B8] mb-4">
                    {totalInterventions}
                  </p>
                  <div className="flex items-center gap-2 text-[#454652]">
                    <img src="/calendar.svg" alt="Calendrier" className="w-[11px] h-[12px]" />
                    <span className="font-[family-name:var(--font-manrope)] text-[16px]">
                      Période: Tout le temps
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-[#E3E0FF] rounded-xl flex items-center justify-center">
                  <CheckSquare className="text-[#2D44B8]" size={28} />
                </div>
              </div>
            </div>

            {/* Terminées card */}
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 border-l-4 border-[#68E8DD]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-[family-name:var(--font-manrope)] text-[20px] text-[#454652] mb-2">
                    Terminées
                  </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-5xl sm:text-[71px] font-bold leading-none text-[#1FB8AF] mb-4">
                    {terminées}
                  </p>
                  <div className="flex items-center gap-2 text-[#454652]">
                    <TrendingUp size={14} className="text-[#454652]" />
                    <span className="font-[family-name:var(--font-manrope)] text-[16px]">
                      Taux de complétion: {tauxCompletion}%
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-[#BCEEE8] rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-[#1FB8AF]" size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Interventions list or empty state */}
          {!titleClient ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="18" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"/>
                    <path d="M24 16V24L28 28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-100 rounded-full flex items-center justify-center border-2 border-white">
                  <Ban className="text-red-500" size={14} />
                </div>
              </div>

              <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-slate-900 mb-3">
                Historique
              </h3>
              <p className="font-[family-name:var(--font-manrope)] text-slate-500 mb-6 max-w-sm mx-auto">
                Veuillez choisir une ligne pour afficher l&apos;historique des interventions.
              </p>

              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-[family-name:var(--font-montserrat)] font-medium transition-colors"
              >
                <Search size={18} />
                Choisir une ligne
              </button>
            </div>
          ) : selectedInterventions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center">
              {/* Empty state illustration */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                  {/* Dashed circle with clock icon */}
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="18" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"/>
                    <path d="M24 16V24L28 28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Red badge */}
                <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-100 rounded-full flex items-center justify-center border-2 border-white">
                  <Ban className="text-red-500" size={14} />
                </div>
              </div>

              <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-slate-900 mb-3">
                Aucune intervention
              </h3>
              <p className="font-[family-name:var(--font-manrope)] text-slate-500 mb-6 max-w-sm mx-auto">
                L&apos;historique des interventions apparaîtra ici une fois que vos missions sur le terrain seront terminées.
              </p>
              
              {/* Purple button */}
              <button 
                onClick={() => router.push('/dashboard/interventions')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-[family-name:var(--font-montserrat)] font-medium transition-colors"
              >
                <Search size={18} />
                Vérifier mes missions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedInterventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-slate-900">
                        {intervention.resolutionCode || 'Non spécifié'}
                      </h3>
                      <p className="font-[family-name:var(--font-manrope)] text-sm text-slate-500">
                        {intervention.productType || 'Type non spécifié'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      intervention.status === 'Terminé'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {intervention.status}
                    </span>
                  </div>

                  {intervention.resolutionObservation && (
                    <p className="font-[family-name:var(--font-manrope)] text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg p-3">
                      {intervention.resolutionObservation}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span className="font-[family-name:var(--font-montserrat)]">{intervention.technicien.prenom} {intervention.technicien.nom}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span className="font-[family-name:var(--font-manrope)]">{formatDate(intervention.createdAt)}</span>
                    </div>
                  </div>

                  {!client && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-600">
                        <span className="font-[family-name:var(--font-montserrat)] font-medium">{intervention.client.nom}</span>
                        <span className="text-slate-400 mx-2">•</span>
                        <span className="font-[family-name:var(--font-manrope)] text-xs">{intervention.client.dLigne}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

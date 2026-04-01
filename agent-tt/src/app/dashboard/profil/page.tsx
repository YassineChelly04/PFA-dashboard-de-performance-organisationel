'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  CheckSquare,
  TrendingUp,
  Clock,
  ChevronRight,
  ChevronDown,
  Search,
  Archive,
  FileText
} from 'lucide-react'

interface Intervention {
  id: string
  productType: string | null
  resolutionCode: string | null
  status: string
  createdAt: string
  client: {
    nom: string
    dLigne: string
  }
}

export default function ProfilPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInterventions() {
      try {
        const res = await fetch('/api/interventions')
        if (res.ok) {
          const data = await res.json()
          setInterventions(data.interventions || [])
        }
      } catch (error) {
        console.error('Error fetching interventions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInterventions()
  }, [])

  const completed = interventions.filter(i => i.status === 'Terminé')
  const tauxResolution = interventions.length > 0 
    ? Math.round((completed.length / interventions.length) * 100) 
    : 95

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="flex-1 px-4 lg:px-[20%] py-6">
        <div className="w-full space-y-6">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Info Card */}
            <div className="relative overflow-hidden bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 min-h-[160px] flex items-center">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-purple-100/40" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <img src="/profile.svg" alt="Profil" className="w-9 h-9" />
                  <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-[#243B9C] leading-tight flex items-center gap-2">
                    {user?.name || 'Mohamed Ben Ali'}
                  </h2>
                </div>
                <p className="font-[family-name:var(--font-montserrat)] text-slate-600 text-base ml-12 flex items-center gap-2">
                  <img src="/techni.svg" alt="Technicien" className="w-[18px] h-[18px]" />
                  <span>Technicien de terrain</span>
                </p>
              </div>
            </div>

            {/* Interventions ce mois */}
            <div className="relative overflow-hidden bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 min-h-[160px] border-l-4 border-l-[#2D44B8]">
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#F3ECFF] -translate-y-10 translate-x-10 opacity-70" />
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[128px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-manrope)] text-lg text-slate-700 mb-2">
                      Total interventions
                    </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-[64px] leading-none font-bold text-[#2D44B8]">
                      {loading ? '0' : interventions.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#E3E0FF] flex items-center justify-center shadow-sm shrink-0 mt-1">
                      <img src="/interv.svg" alt="Interventions" className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex items-center gap-2 font-[family-name:var(--font-manrope)] text-sm mt-2 text-[#314158]">
                  <img src="/calendar.svg" alt="Calendrier" className="w-[11px] h-[12px]" />
                  <span>Période: Tout le temps</span>
                </div>
              </div>
            </div>

            {/* Taux de résolution */}
            <div className="relative overflow-hidden bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 min-h-[160px] border-l-4 border-l-[#2ED8C3]">
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[128px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-manrope)] text-lg text-slate-700 mb-2">
                      Terminées
                    </p>
                    <p className="font-[family-name:var(--font-montserrat)] text-[64px] leading-none font-bold text-[#1BBBAF]">
                      {loading ? '0' : completed.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#DFFCF6] flex items-center justify-center shadow-sm shrink-0 mt-1">
                      <img src="/perform.svg" alt="Terminées" className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-[family-name:var(--font-manrope)] text-sm mt-2">
                  <img src="/up.svg" alt="Taux" className="w-3 h-3" />
                  <span>Taux de complétion: {loading ? '0%' : `${tauxResolution}%`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des Interventions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/history.svg" alt="Historique" className="w-[18px] h-[18px]" />
              <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-[#1E2F97]">
                Historique des Interventions
              </h3>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
              {interventions.length === 0 ? (
                <div className="text-center">
                  {/* Empty state icon */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileText className="text-slate-400" size={40} />
                  </div>

                  <h4 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-slate-900 mb-3">
                    Aucune intervention récente
                  </h4>
                  <p className="font-[family-name:var(--font-manrope)] text-slate-500 mb-8 max-w-md mx-auto">
                    Il n&apos;y a aucune activité enregistrée pour cette période.
                    Vous pouvez rechercher un client pour démarrer une nouvelle fiche technique.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-[family-name:var(--font-montserrat)] font-medium transition-colors"
                    >
                      <Search size={18} />
                      Rechercher un client
                    </Link>
                    <Link
                      href="/dashboard/historique"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-[family-name:var(--font-montserrat)] font-medium transition-colors"
                    >
                      <Archive size={18} />
                      Voir les archives
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {interventions.slice(0, 5).map((intervention) => (
                    <Link
                      key={intervention.id}
                      href={`/dashboard/client/${intervention.client.dLigne}`}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="font-[family-name:var(--font-montserrat)] font-medium text-slate-900">
                          {intervention.client.nom}
                        </p>
                        <p className="font-[family-name:var(--font-manrope)] text-xs text-slate-500">
                          {intervention.client.dLigne}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        intervention.status === 'Terminé'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {intervention.status}
                      </span>
                    </Link>
                  ))}
                  <div className="text-center pt-4">
                    <Link
                      href="/dashboard/historique"
                      className="font-[family-name:var(--font-manrope)] text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Voir tout l&apos;historique →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Paramètres du Compte */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/prm.svg" alt="Paramètres du compte" className="w-5 h-5" />
              <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-[#1E2F97]">
                Paramètres du Compte
              </h3>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Préférences de Langue */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/lng.svg" alt="Préférences de langue" className="w-[18px] h-[18px]" />
                    <span className="font-[family-name:var(--font-montserrat)] text-slate-900 font-semibold">
                      Préférences de Langue
                    </span>
                  </div>
                  
                  <button className="w-full flex items-center justify-between px-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 shadow-sm">
                    <span className="font-[family-name:var(--font-manrope)]">Français</span>
                    <ChevronDown size={18} className="text-slate-400" />
                  </button>
                  
                  <p className="font-[family-name:var(--font-manrope)] text-xs text-slate-500 mt-3 leading-relaxed">
                    La langue sélectionnée s&apos;appliquera à l&apos;ensemble de votre interface fournisseur.
                  </p>
                </div>

                {/* Sécurité & Accès */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/shield.svg" alt="Sécurité et accès" className="w-[18px] h-[18px]" />
                    <span className="font-[family-name:var(--font-montserrat)] text-slate-900 font-semibold">
                      Sécurité & Accès
                    </span>
                  </div>
                  
                  <button className="w-full flex items-center justify-between px-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 shadow-sm hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src="/lock.svg" alt="Changer le mot de passe" className="w-4 h-4" />
                      <span className="font-[family-name:var(--font-manrope)]">Changer le mot de passe</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  
                  <p className="font-[family-name:var(--font-manrope)] text-xs text-slate-500 mt-3 leading-relaxed">
                    Dernière modification il y a 3 mois. Nous recommandons de changer votre mot de passe régulièrement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <button className="px-8 py-3 bg-[#5F2EE5] hover:bg-[#4E24CE] text-white rounded-xl font-[family-name:var(--font-montserrat)] font-medium transition-colors">
              Enregistrer les modifications
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="font-[family-name:var(--font-manrope)] text-sm text-slate-600">
                Système Opérationnel
              </span>
              <span className="font-[family-name:var(--font-manrope)] text-xs text-slate-400 border-l border-slate-200 pl-2">
                v2.4.1
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

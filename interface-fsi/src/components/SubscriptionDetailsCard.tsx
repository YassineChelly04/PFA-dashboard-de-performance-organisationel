'use client'

import { MapPin } from 'lucide-react'

interface SubscriptionDetailsCardProps {
  dligne: string
  status: string
  offer: string
  debit: string
  region: string
}

export default function SubscriptionDetailsCard({
  dligne = "71 234 567",
  status = "Opérationnel",
  offer = "VDSL Premium Plus",
  debit = "50 Mbps (Up to 100)",
  region = "Grand Tunis, Ariana Centre",
}: SubscriptionDetailsCardProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#16C5D8]"></div>

        <div className="px-5 py-8 sm:pl-8 sm:pr-10 sm:py-12">
          {/* Header with title and badge */}
          <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="font-[family-name:var(--font-plus-jakarta-sans)] text-2xl sm:text-3xl font-bold text-[#0F1C3F]">
              Détails de l&apos;Abonnement
            </h2>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4F8FB]">
              <div className="w-3 h-3 rounded-full bg-[#16C5D8]"></div>
              <span className="font-[family-name:var(--font-manrope)] text-xs font-bold text-[#16C5D8] tracking-wide">
                LIGNE ACTIVE
              </span>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            {/* Column 1 */}
            <div>
              {/* DLIGNE */}
              <div className="mb-8">
                <p className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#8899BB] tracking-wide mb-2">
                  DLIGNE
                </p>
                <p className="font-[family-name:var(--font-plus-jakarta-sans)] text-2xl font-bold text-[#0F1C3F]">
                  {dligne}
                </p>
              </div>

              {/* OFFRE */}
              <div>
                <p className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#8899BB] tracking-wide mb-2">
                  OFFRE
                </p>
                <p className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg font-bold text-[#0F1C3F]">
                  {offer}
                </p>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              {/* STATUS */}
              <div className="mb-8">
                <p className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#8899BB] tracking-wide mb-2">
                  STATUS
                </p>
                <p className="font-[family-name:var(--font-plus-jakarta-sans)] text-2xl font-bold text-[#16C5D8]">
                  {status}
                </p>
              </div>

              {/* DÉBIT */}
              <div>
                <p className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#8899BB] tracking-wide mb-2">
                  DÉBIT
                </p>
                <p className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg font-bold text-[#16C5D8]">
                  {debit}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-[#E8EBF5]"></div>

          {/* RÉGION & ZONE */}
          <div>
            <p className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#8899BB] tracking-wide mb-2">
              RÉGION & ZONE
            </p>
            <div className="flex items-start gap-3">
              <MapPin size={24} className="text-[#0F1C3F] mt-1 flex-shrink-0" />
              <p className="font-[family-name:var(--font-plus-jakarta-sans)] text-lg sm:text-xl font-bold text-[#0F1C3F]">
                {region}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

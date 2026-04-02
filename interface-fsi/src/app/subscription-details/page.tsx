'use client'

import SubscriptionDetailsCard from '@/components/SubscriptionDetailsCard'

export default function SubscriptionDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-12 px-4">
      <div className="flex items-center justify-center">
        <SubscriptionDetailsCard
          dligne="71 234 567"
          status="Opérationnel"
          offer="VDSL Premium Plus"
          debit="50 Mbps (Up to 100)"
          region="Grand Tunis, Ariana Centre"
        />
      </div>
    </div>
  )
}

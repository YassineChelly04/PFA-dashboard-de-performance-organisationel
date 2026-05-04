'use client'

import Image from 'next/image'
import { CircleHelp } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center justify-between w-full min-h-[72px] px-4 pl-16 sm:px-6 sm:pl-20 lg:px-8 lg:pl-8">
        <div className="flex items-center gap-3">
          <Image src="/logo-tt.png" alt="Tunisie Telecom" width={96} height={48} className="h-10 w-auto" />
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tunisie Telecom</div>
            <div className="text-sm font-bold text-[#2D44B8]">Espace Technicien</div>
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-montserrat)] text-[20px] sm:text-[24px] font-bold text-[#2D44B8]">
          {title}
        </h1>

        <CircleHelp size={18} className="text-slate-500" />
      </div>
    </header>
  )
}

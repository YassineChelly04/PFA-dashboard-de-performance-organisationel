'use client'

import { CircleHelp } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center justify-between w-full min-h-[72px] px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-montserrat)] text-[24px] font-bold text-[#2D44B8]">
          {title}
        </h1>

        <CircleHelp size={18} className="text-slate-500" />
      </div>
    </header>
  )
}

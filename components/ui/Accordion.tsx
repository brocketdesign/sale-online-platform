'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

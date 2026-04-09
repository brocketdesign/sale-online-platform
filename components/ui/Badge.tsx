import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'pink' | 'outline'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  pink: 'bg-[#FF90E8]/20 text-[#FF007A]',
  outline: 'border border-gray-300 text-gray-600 bg-transparent',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

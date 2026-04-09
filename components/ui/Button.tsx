import React from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#FF007A] text-white hover:bg-[#e0006e] active:bg-[#c4005f] shadow-sm',
  secondary: 'bg-brand-black text-white hover:bg-gray-800 active:bg-gray-900 shadow-sm',
  outline: 'border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white',
  ghost: 'text-brand-black hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF007A] focus-visible:ring-offset-2',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
}

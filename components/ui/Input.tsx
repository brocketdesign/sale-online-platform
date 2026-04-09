import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#FF007A]/30 focus:border-[#FF007A]',
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500'
              : 'border-gray-200 bg-white hover:border-gray-300',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input

'use client'

import { UseFormRegister, FieldError } from 'react-hook-form'

interface FormInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  register: UseFormRegister<any>
  error?: FieldError
  helpText?: string
}

export function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  register,
  error,
  helpText,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-usfr-dark mb-1">
        {label}
        {required && <span className="text-usfr-error ml-1">*</span>}
      </label>
      <input
        {...register(name)}
        type={type}
        id={name}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-usfr-error focus:ring-usfr-error/20'
            : 'border-gray-300 focus:ring-usfr-secondary/20 focus:border-usfr-secondary'
        }`}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-usfr-muted">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-usfr-error">{error.message}</p>
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  required?: boolean
  register: UseFormRegister<any>
  error?: FieldError
  helpText?: string
}

export function FormSelect({
  label,
  name,
  options,
  required = false,
  register,
  error,
  helpText,
}: FormSelectProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-usfr-dark mb-1">
        {label}
        {required && <span className="text-usfr-error ml-1">*</span>}
      </label>
      <select
        {...register(name)}
        id={name}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 bg-white ${
          error
            ? 'border-usfr-error focus:ring-usfr-error/20'
            : 'border-gray-300 focus:ring-usfr-secondary/20 focus:border-usfr-secondary'
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="mt-1 text-xs text-usfr-muted">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-usfr-error">{error.message}</p>
      )}
    </div>
  )
}

interface FormCheckboxProps {
  label: string
  name: string
  register: UseFormRegister<any>
  error?: FieldError
  helpText?: string
}

export function FormCheckbox({
  label,
  name,
  register,
  error,
  helpText,
}: FormCheckboxProps) {
  return (
    <div className="mb-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          {...register(name)}
          type="checkbox"
          className="mt-1 w-4 h-4 text-usfr-secondary border-gray-300 rounded focus:ring-usfr-secondary"
        />
        <span className="text-sm text-usfr-dark">{label}</span>
      </label>
      {helpText && !error && (
        <p className="mt-1 ml-7 text-xs text-usfr-muted">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 ml-7 text-xs text-usfr-error">{error.message}</p>
      )}
    </div>
  )
}

interface FormTextareaProps {
  label: string
  name: string
  placeholder?: string
  required?: boolean
  rows?: number
  register: UseFormRegister<any>
  error?: FieldError
  helpText?: string
}

export function FormTextarea({
  label,
  name,
  placeholder,
  required = false,
  rows = 3,
  register,
  error,
  helpText,
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-usfr-dark mb-1">
        {label}
        {required && <span className="text-usfr-error ml-1">*</span>}
      </label>
      <textarea
        {...register(name)}
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 resize-none ${
          error
            ? 'border-usfr-error focus:ring-usfr-error/20'
            : 'border-gray-300 focus:ring-usfr-secondary/20 focus:border-usfr-secondary'
        }`}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-usfr-muted">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-usfr-error">{error.message}</p>
      )}
    </div>
  )
}

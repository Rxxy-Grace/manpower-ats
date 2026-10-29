import React from 'react'
import { STAGE_COLORS } from '../../data/seedData'

const presets = {
  stage: (val) => STAGE_COLORS[val] || 'bg-gray-100 text-gray-600',
  status: (val) => ({
    Open: 'bg-green-100 text-green-700',
    Closed: 'bg-gray-100 text-gray-600',
    Draft: 'bg-yellow-100 text-yellow-700',
    Paused: 'bg-orange-100 text-orange-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  }[val] || 'bg-gray-100 text-gray-600'),
  tag: () => 'bg-indigo-50 text-indigo-700',
}

export default function Badge({ children, variant = 'tag', value, className = '' }) {
  const colorClass = variant === 'custom'
    ? className
    : presets[variant]?.(value || children) || 'bg-gray-100 text-gray-600'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {children}
    </span>
  )
}

import React from 'react'

const colors = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
]

function getColor(initials) {
  const sum = initials.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

export default function Avatar({ initials = '??', size = 'md', className = '' }) {
  const color = getColor(initials)
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

import React from 'react'

export const Card = ({ children, className = '', onClick = null, ...props }) => {
  const hasCustomBg = className.includes('bg-')
  const baseClass = onClick ? 'soft-card-interactive cursor-pointer' : 'soft-card'
  const styleClass = hasCustomBg ? baseClass.replace('soft-card', 'soft-card-base') : baseClass

  return (
    <div
      onClick={onClick}
      className={`${styleClass} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

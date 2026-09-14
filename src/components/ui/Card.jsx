import React from 'react'

export const Card = ({ children, className = '', onClick = null, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`${
        onClick ? 'soft-card-interactive cursor-pointer' : 'soft-card'
      } p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

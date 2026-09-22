import React from 'react'
import zeloOrbitSvg from '../../assets/zelo-orbit.svg'

export const ZeloOrbitButton = ({ onClick, isActive = false, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open ZELO AI"
      title="Open ZELO AI"
      className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-all transform active:scale-95 cursor-pointer border-2 border-white bg-emerald-600 hover:bg-emerald-700 overflow-hidden ${
        isActive ? 'scale-105 ring-4 ring-emerald-400/50 shadow-emerald-500/60' : 'hover:scale-105'
      } ${className}`}
    >
      <img
        src={zeloOrbitSvg}
        alt="ZELO AI"
        className="w-full h-full object-cover transition-transform duration-200"
      />
    </button>
  )
}

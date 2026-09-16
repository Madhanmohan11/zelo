import React, { useState } from 'react'
import { Edit2 } from 'lucide-react'
import { useTimePeriod, DEFAULT_TWO_LINE_SLOGAN } from '../../hooks/useTimePeriod'
import { EditSloganModal } from './EditSloganModal'

export const DynamicHero = ({
  userName = 'Madhan',
  customSlogan = null,
  dynamicHeroEnabled = true,
  autoTimeBgEnabled = true,
  onSloganUpdated = () => {}
}) => {
  const { periodConfig } = useTimePeriod(autoTimeBgEnabled)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Use custom slogan if defined, otherwise default 2-line slogan
  const rawSlogan = (customSlogan && customSlogan.trim().length > 0)
    ? customSlogan
    : DEFAULT_TWO_LINE_SLOGAN

  // Format date: WEDNESDAY, SEPTEMBER 16, 2026
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase()

  const greetingText = periodConfig.greetingTemplate(userName)

  return (
    <>
      <div
        className={`w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 relative overflow-hidden rounded-t-none rounded-b-[22px] transition-all duration-700 shadow-md min-h-[20px] sm:min-h-[220px] flex flex-col justify-between p-6 sm:p-8 ${
          imgError || !dynamicHeroEnabled
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white'
            : 'bg-slate-900 text-white'
        }`}
        style={
          dynamicHeroEnabled && !imgError && periodConfig.bgImage
            ? {
                backgroundImage: `url(${periodConfig.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }
            : undefined
        }
      >
        {/* HIDDEN IMAGE TAG FOR ERROR FALLBACK DETECTION */}
        {dynamicHeroEnabled && periodConfig.bgImage && (
          <img
            src={periodConfig.bgImage}
            alt="Hero Background"
            className="hidden"
            onError={() => setImgError(true)}
          />
        )}

        {/* GRADIENT OVERLAY FOR GUARANTEED TEXT READABILITY */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${periodConfig.overlayClass || 'bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-900/25'}`} />

        {/* TOP ROW: DYNAMIC DATE & TIME PERIOD BADGE */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-200/90 font-mono">
            {formattedDate}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-xs border flex items-center gap-1.5 ${
              periodConfig.badgeStyle || 'bg-indigo-900/60 border-indigo-500/50 text-indigo-100'
            }`}
          >
            <span>{periodConfig.icon}</span>
            <span>{periodConfig.badgeLabel}</span>
          </div>
        </div>

        {/* MAIN HERO CONTENT */}
        <div className="relative z-10 my-auto pt-4 pb-2 max-w-xl">
          {/* GREETING */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs flex items-center gap-2">
            {greetingText}
          </h1>

          {/* CLEAN TWO-LINE EDITABLE SLOGAN (NO BORDER BOX, NO STAR ICON) */}
          <div className="mt-3 flex items-start gap-2 group">
            <div className="text-xs sm:text-sm font-semibold text-slate-100/95 leading-relaxed tracking-wide whitespace-pre-line drop-shadow-xs">
              {rawSlogan}
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="Edit slogan"
              aria-label="Edit slogan"
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer opacity-80 group-hover:opacity-100 shrink-0 mt-0.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT SLOGAN MODAL */}
      <EditSloganModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentSlogan={customSlogan || ''}
        onSaveSuccess={(newSlogan) => onSloganUpdated(newSlogan)}
      />
    </>
  )
}

import React, { useState, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { getInitials, getAvatarSignedUrl } from '../../services/avatarService'

const sizeClasses = {
  sm: { box: 'w-8 h-8 text-xs font-bold', camera: 'w-3 h-3', iconPad: 'p-1' },
  md: { box: 'w-12 h-12 text-sm font-extrabold', camera: 'w-3.5 h-3.5', iconPad: 'p-1.5' },
  lg: { box: 'w-20 h-20 text-xl font-black', camera: 'w-4 h-4', iconPad: 'p-2' },
  xl: { box: 'w-24 h-24 text-2xl font-black', camera: 'w-4 h-4', iconPad: 'p-2' }
}

export const UserAvatar = ({
  avatarPath = null,
  name = '',
  size = 'md',
  editable = false,
  onEditClick = null,
  isLoading = false,
  className = ''
}) => {
  const [signedUrl, setSignedUrl] = useState(null)
  const [imgError, setImgError] = useState(false)

  const sizeConfig = sizeClasses[size] || sizeClasses.md
  const initials = getInitials(name)

  useEffect(() => {
    let isMounted = true
    setImgError(false)

    if (avatarPath) {
      getAvatarSignedUrl(avatarPath).then((url) => {
        if (isMounted) {
          setSignedUrl(url)
        }
      })
    } else {
      setSignedUrl(null)
    }

    return () => {
      isMounted = false
    }
  }, [avatarPath])

  const showImage = Boolean(signedUrl && !imgError)

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={signedUrl}
          alt={name || 'User Avatar'}
          onError={() => setImgError(true)}
          className={`${sizeConfig.box} rounded-full object-cover border-2 border-slate-200 shadow-xs transition-all`}
        />
      ) : (
        <div
          className={`${sizeConfig.box} rounded-full bg-gradient-to-tr from-emerald-800 to-teal-700 text-white flex items-center justify-center border-2 border-emerald-600/40 shadow-xs select-none uppercase tracking-wider`}
        >
          {initials}
        </div>
      )}

      {/* LOADING OVERLAY SPINNER */}
      {isLoading && (
        <div className={`absolute inset-0 rounded-full bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white z-10`}>
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {/* EDIT / CAMERA OVERLAY BADGE */}
      {editable && onEditClick && !isLoading && (
        <button
          type="button"
          onClick={onEditClick}
          title="Change profile photo"
          aria-label="Change profile photo"
          className={`absolute bottom-0 right-0 ${sizeConfig.iconPad} rounded-full bg-slate-900 hover:bg-emerald-600 text-white shadow-md transition-all border border-white cursor-pointer active:scale-95`}
        >
          <Camera className={sizeConfig.camera} />
        </button>
      )}
    </div>
  )
}

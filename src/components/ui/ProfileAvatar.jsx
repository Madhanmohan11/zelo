import React, { useState, useEffect, useRef } from 'react'
import { Camera, Trash2, Loader2, User } from 'lucide-react'
import { getAvatarSignedUrl, uploadAvatar, removeAvatar, getUserInitials } from '../../services/avatarService'
import { updateUserProfile } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const ProfileAvatar = ({
  size = 'lg',
  editable = false,
  showRemove = false,
  onAvatarUpdated,
  className = ''
}) => {
  const { user, profile, loadUserData } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)

  const [signedUrl, setSignedUrl] = useState(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const avatarPath = profile?.avatar_url
  const fullName = profile?.full_name || 'ZELO User'
  const initials = getUserInitials(fullName)

  // Resolve private signed URL whenever profile.avatar_url changes
  useEffect(() => {
    let mounted = true

    const resolveUrl = async () => {
      if (!avatarPath) {
        setSignedUrl(null)
        return
      }

      setIsLoadingUrl(true)
      try {
        const url = await getAvatarSignedUrl(avatarPath)
        if (mounted) setSignedUrl(url)
      } catch (e) {
        console.warn('Failed to resolve avatar signed URL:', e)
        if (mounted) setSignedUrl(null)
      } finally {
        if (mounted) setIsLoadingUrl(false)
      }
    }

    resolveUrl()

    return () => {
      mounted = false
    }
  }, [avatarPath])

  // Size styling maps
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl'
  }

  const cameraBtnSizeMap = {
    sm: 'p-1 bottom-0 right-0',
    md: 'p-1.5 bottom-0 right-0',
    lg: 'p-2.5 bottom-0 right-0',
    xl: 'p-3 bottom-1 right-1'
  }

  const cameraIconSizeMap = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    try {
      // 1. Upload & compress avatar via avatarService
      const newPath = await uploadAvatar(user.id, file)

      // 2. Update profiles table in database
      await updateUserProfile(user.id, { avatar_url: newPath })

      // 3. Reload session profile & signed URL
      await loadUserData(user.id)
      const freshUrl = await getAvatarSignedUrl(newPath)
      setSignedUrl(freshUrl)

      showToast('Profile photo updated!', 'success')
      if (onAvatarUpdated) onAvatarUpdated(newPath)
    } catch (err) {
      console.error('Avatar upload error:', err)
      showToast(err.message || 'Failed to upload profile photo.', 'error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = async () => {
    if (!user || !avatarPath) return

    setIsUploading(true)
    try {
      await removeAvatar(user.id, avatarPath)
      await updateUserProfile(user.id, { avatar_url: null })
      await loadUserData(user.id)
      setSignedUrl(null)
      showToast('Profile photo removed.', 'info')
      if (onAvatarUpdated) onAvatarUpdated(null)
    } catch (err) {
      console.error('Avatar removal error:', err)
      showToast('Failed to remove photo.', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative inline-block ${className}`}>
        {/* Hidden File Input */}
        {editable && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            aria-label="Upload profile image"
          />
        )}

        {/* Main Circle Avatar Container */}
        <div
          className={`${sizeMap[size] || sizeMap.lg} rounded-full border-4 border-white shadow-md overflow-hidden relative flex items-center justify-center transition-all bg-emerald-50 text-emerald-800 font-extrabold select-none ${
            editable && !isUploading ? 'cursor-pointer hover:opacity-95' : ''
          }`}
          onClick={() => {
            if (editable && !isUploading && fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
        >
          {signedUrl ? (
            <img
              src={signedUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={() => setSignedUrl(null)}
            />
          ) : (
            <span className="tracking-wider">{initials}</span>
          )}

          {/* Uploading / Loading Overlay */}
          {(isUploading || isLoadingUrl) && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Camera / Edit Overlay Button */}
        {editable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (fileInputRef.current) fileInputRef.current.click()
            }}
            disabled={isUploading}
            className={`absolute ${cameraBtnSizeMap[size] || cameraBtnSizeMap.lg} rounded-full bg-[#0F172A] hover:bg-slate-800 text-white shadow-md transition-transform active:scale-95 cursor-pointer z-10`}
            title="Change Profile Photo"
            aria-label="Change Profile Photo"
          >
            <Camera className={`${cameraIconSizeMap[size] || cameraIconSizeMap.lg} text-emerald-400`} />
          </button>
        )}
      </div>

      {/* Remove Avatar Button (when image exists and showRemove is true) */}
      {editable && showRemove && avatarPath && !isUploading && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200/60 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove photo
        </button>
      )}
    </div>
  )
}

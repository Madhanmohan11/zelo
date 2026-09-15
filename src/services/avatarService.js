import { supabase, isSupabaseConfigured } from '../lib/supabase'

// -----------------------------------------------------------------------------
// HELPER: GENERATE USER INITIALS FROM NAME / EMAIL
// -----------------------------------------------------------------------------
export const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'Z'
  const clean = name.trim()
  if (!clean) return 'Z'

  // If email address, use first letter
  if (clean.includes('@')) {
    return clean.charAt(0).toUpperCase()
  }

  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  const firstInitial = parts[0].charAt(0).toUpperCase()
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return `${firstInitial}${lastInitial}`
}

// -----------------------------------------------------------------------------
// BROWSER CANVAS IMAGE COMPRESSION & SQUARE CROPPING
// -----------------------------------------------------------------------------
export const compressAndResizeImage = (file, targetSize = 512, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image element'))
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = targetSize
          canvas.height = targetSize
          const ctx = canvas.getContext('2d')

          // Calculate center square crop coordinates
          const minDim = Math.min(img.width, img.height)
          const sx = (img.width - minDim) / 2
          const sy = (img.height - minDim) / 2

          // Draw cropped & resized square image onto canvas
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize)

          // Try exporting to WebP first, fallback to JPEG
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                canvas.toBlob(
                  (jpegBlob) => {
                    if (jpegBlob) resolve(jpegBlob)
                    else reject(new Error('Canvas image compression failed'))
                  },
                  'image/jpeg',
                  quality
                )
              }
            },
            'image/webp',
            quality
          )
        } catch (err) {
          reject(err)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Cache for signed URLs in memory
const signedUrlCache = new Map()

// -----------------------------------------------------------------------------
// GET SIGNED URL FOR PRIVATE AVATAR OBJECT
// -----------------------------------------------------------------------------
export const getAvatarSignedUrl = async (avatarPath) => {
  if (!avatarPath) return null

  // If already an absolute HTTP URL (legacy), return directly
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    // If it's old unsplash URL, return null so initials render
    if (avatarPath.includes('unsplash.com')) return null
    return avatarPath
  }

  // Check in-memory cache if valid
  const cached = signedUrlCache.get(avatarPath)
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.url
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600) // 1 hour validity

      if (error) {
        console.warn('Error fetching signed avatar URL:', error)
        return null
      }

      if (data?.signedUrl) {
        signedUrlCache.set(avatarPath, {
          url: data.signedUrl,
          expiresAt: Date.now() + 3500 * 1000
        })
        return data.signedUrl
      }
    } catch (e) {
      console.warn('Storage signed URL error:', e)
    }
  }

  return null
}

// -----------------------------------------------------------------------------
// UPLOAD AVATAR TO PRIVATE SUPABASE STORAGE & UPDATE PROFILE
// -----------------------------------------------------------------------------
export const uploadAvatar = async (file, userId) => {
  if (!userId) throw new Error('User must be authenticated')
  if (!file) throw new Error('No image file provided')

  // 1. Validate File Type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Please select a JPG, PNG, or WebP image.')
  }

  // 2. Validate File Size (Max 5 MB)
  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error('Image must be smaller than 5 MB.')
  }

  // 3. Compress & Resize image via Canvas
  const compressedBlob = await compressAndResizeImage(file, 512, 0.85)

  const storagePath = `${userId}/profile.webp`

  if (isSupabaseConfigured && supabase) {
    // 4. Upload object to 'avatars' bucket with upsert: true
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, compressedBlob, {
        contentType: 'image/webp',
        upsert: true
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      throw new Error('Unable to upload photo to storage. Please ensure the avatars bucket is created.')
    }

    // 5. Update profiles table avatar_url column with relative path
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        avatar_url: storagePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (dbError) {
      console.error('Database avatar_url update error:', dbError)
      throw new Error('Failed to update profile record.')
    }

    // Invalidate cache and get fresh signed URL
    signedUrlCache.delete(storagePath)
    const freshSignedUrl = await getAvatarSignedUrl(storagePath)

    return {
      path: storagePath,
      signedUrl: freshSignedUrl
    }
  }

  // Local Storage Fallback Mode
  const base64Data = await new Promise((res) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result)
    reader.readAsDataURL(compressedBlob)
  })

  try {
    localStorage.setItem(`zelo_avatar_blob_${userId}`, base64Data)
    const profile = JSON.parse(localStorage.getItem(`zelo_profile_${userId}`) || '{}')
    profile.avatar_url = base64Data
    localStorage.setItem(`zelo_profile_${userId}`, JSON.stringify(profile))
  } catch (e) {
    console.error('LocalStorage avatar save error:', e)
  }

  return {
    path: base64Data,
    signedUrl: base64Data
  }
}

// -----------------------------------------------------------------------------
// REMOVE AVATAR PHOTO
// -----------------------------------------------------------------------------
export const removeAvatar = async (userId, currentPath) => {
  if (!userId) throw new Error('User must be authenticated')

  const storagePath = currentPath || `${userId}/profile.webp`

  if (isSupabaseConfigured && supabase) {
    // 1. Delete object from storage if exists
    try {
      await supabase.storage.from('avatars').remove([storagePath])
    } catch (e) {
      console.warn('Storage remove warning:', e)
    }

    // 2. Clear avatar_url column in profiles database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (dbError) {
      throw new Error('Failed to clear profile photo in database.')
    }

    signedUrlCache.delete(storagePath)
  } else {
    try {
      localStorage.removeItem(`zelo_avatar_blob_${userId}`)
      const profile = JSON.parse(localStorage.getItem(`zelo_profile_${userId}`) || '{}')
      profile.avatar_url = null
      localStorage.setItem(`zelo_profile_${userId}`, JSON.stringify(profile))
    } catch (e) {}
  }

  return true
}

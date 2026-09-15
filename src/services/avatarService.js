import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Resizes an image file using HTML5 canvas to max 512x512 and compresses to WebP/JPEG Blob.
 */
export const compressAndResizeImage = (file, maxWidth = 512, maxHeight = 512, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.onerror = (err) => reject(err)

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas blob conversion failed'))
            return
          }
          resolve(blob)
        },
        'image/webp',
        quality
      )
    }

    reader.readAsDataURL(file)
  })
}

// In-memory cache for signed URLs to minimize Supabase API calls
const signedUrlCache = new Map()

/**
 * Gets a signed display URL for a private storage avatar path.
 */
export const getAvatarSignedUrl = async (avatarPath) => {
  if (!avatarPath) return null
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('blob:')) {
    return avatarPath
  }

  const cached = signedUrlCache.get(avatarPath)
  if (cached && cached.expiry > Date.now()) {
    return cached.url
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 86400) // 24 hours expiry

      if (!error && data?.signedUrl) {
        signedUrlCache.set(avatarPath, {
          url: data.signedUrl,
          expiry: Date.now() + 86400 * 1000 - 60000 // 24h minus 1 minute margin
        })
        return data.signedUrl
      }
    } catch (e) {
      console.warn('Failed to generate signed URL for avatar:', e)
    }
  }

  return null
}

/**
 * Uploads a profile image file to Supabase Storage bucket "avatars"
 * Target path: ${userId}/profile.webp
 */
export const uploadAvatar = async (userId, file) => {
  if (!userId) throw new Error('User authentication required')

  // 1. Validate File Type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, or WebP).')
  }

  // 2. Validate File Size (Max 5 MB)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image must be smaller than 5 MB.')
  }

  // 3. Client-side Resize & Compression
  let blobToUpload
  try {
    blobToUpload = await compressAndResizeImage(file, 512, 512, 0.85)
  } catch (err) {
    console.warn('Client-side image resize failed, using original file:', err)
    blobToUpload = file
  }

  const ext = 'webp'
  const filePath = `${userId}/profile.${ext}`

  // 4. Upload to Supabase Storage
  if (isSupabaseConfigured && supabase) {
    const { error: storageError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blobToUpload, {
        contentType: 'image/webp',
        upsert: true
      })

    if (storageError) {
      console.error('Supabase Storage avatar upload error:', storageError)
      throw new Error('Failed to upload image to storage. Please try again.')
    }
  } else {
    // Local storage mock fallback
    const localUrl = URL.createObjectURL(blobToUpload)
    localStorage.setItem(`zelo_avatar_blob_${userId}`, localUrl)
  }

  // Evict stale signed URL from memory cache
  signedUrlCache.delete(filePath)

  return filePath
}

/**
 * Removes current profile avatar from Storage
 */
export const removeAvatar = async (userId, avatarPath) => {
  if (!userId) return null

  if (avatarPath && !avatarPath.startsWith('http') && !avatarPath.startsWith('blob') && isSupabaseConfigured && supabase) {
    try {
      await supabase.storage.from('avatars').remove([avatarPath])
    } catch (e) {
      console.warn('Storage avatar file remove warning (handled gracefully):', e)
    }
  }

  if (avatarPath) {
    signedUrlCache.delete(avatarPath)
  }

  return null
}

/**
 * Computes user initials from full name
 * Example: "Madhan Mohan" -> "MM", "Sarah" -> "S"
 */
export const getUserInitials = (name = '') => {
  if (!name || typeof name !== 'string') return 'Z'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Z'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

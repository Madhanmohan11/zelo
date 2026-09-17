import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for PWA installation status, platform detection, and install prompts.
 */
export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallDismissed, setIsInstallDismissed] = useState(() => {
    return localStorage.getItem('zelo_install_prompt_dismissed') === 'true'
  })

  // Platform & Viewport Detection
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  const isIOS = Boolean(/iphone|ipad|ipod/i.test(userAgent) && !window.MSStream)
  const isAndroid = Boolean(/android/i.test(userAgent))

  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobileDevice = isIOS || isAndroid || windowWidth < 768
  const isDesktop = windowWidth >= 1024 && !isIOS && !isAndroid

  // Detect standalone / installed state
  useEffect(() => {
    const checkStandalone = () => {
      const matchStandalone = window.matchMedia('(display-mode: standalone)').matches
      const navStandalone = window.navigator.standalone === true
      const androidReferrer = document.referrer ? document.referrer.includes('android-app://') : false
      const standaloneState = Boolean(matchStandalone || navStandalone || androidReferrer)
      setIsStandalone(standaloneState)
      if (standaloneState) setIsInstalled(true)
    }

    checkStandalone()

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e) => {
      setIsStandalone(e.matches)
      if (e.matches) setIsInstalled(true)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // Listen for beforeinstallprompt event (Android / Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent default automatic browser prompt
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsStandalone(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Trigger browser installation dialog
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setIsStandalone(true)
        setDeferredPrompt(null)
        return true
      }
    } catch (err) {
      console.warn('PWA install prompt failed:', err)
    }
    return false
  }, [deferredPrompt])

  // Dismiss prompt persistently
  const dismissInstallPrompt = useCallback(() => {
    localStorage.setItem('zelo_install_prompt_dismissed', 'true')
    setIsInstallDismissed(true)
  }, [])

  return {
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isMobileDevice,
    isDesktop,
    canInstall: Boolean(deferredPrompt),
    isInstallDismissed,
    promptInstall,
    dismissInstallPrompt
  }
}

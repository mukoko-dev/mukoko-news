import { useState, useEffect } from 'react'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      // PWA is considered installed if it's running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
      const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
      
      // Check for iOS standalone mode
      const isIOSStandalone = window.navigator.standalone === true
      
      setIsInstalled(isStandalone || isFullscreen || isMinimalUi || isIOSStandalone)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      console.log('💾 Install prompt ready')
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA was installed')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 Back online')
      setIsOffline(false)
    }

    const handleOffline = () => {
      console.log('📱 Gone offline')
      setIsOffline(true)
    }

    // Service worker update detection
    const handleSWUpdate = (registration) => {
      const waiting = registration.waiting
      if (waiting) {
        waiting.addEventListener('statechange', () => {
          if (waiting.state === 'activated') {
            setUpdateAvailable(true)
            console.log('🔄 App update available')
          }
        })
      }
    }

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check installation status
    checkInstalled()

    // Register for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        handleSWUpdate(registration)
        
        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every minute
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`🎯 Install prompt outcome: ${outcome}`)
      
      if (outcome === 'accepted') {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Install prompt error:', error)
      return false
    }
  }

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        const waiting = registration.waiting
        if (waiting) {
          waiting.postMessage({ type: 'SKIP_WAITING' })
          setUpdateAvailable(false)
          window.location.reload()
        }
      })
    }
  }

  return {
    isInstallable,
    isInstalled,
    isOffline,
    updateAvailable,
    installApp,
    updateApp
  }
}
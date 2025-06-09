import React from 'react'
import { 
  ArrowDownOnSquareIcon, 
  XMarkIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { usePWA } from '../hooks/usePWA'

const PWAPrompt = ({ currentColors }) => {
  // Hook is used inside this component
  const { 
    isInstallable, 
    isOffline, 
    updateAvailable, 
    installApp, 
    updateApp 
  } = usePWA()

  // Don't show if nothing to display
  if (!isInstallable && !isOffline && !updateAvailable) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 space-y-2">
      {/* Install Prompt */}
      {isInstallable && (
        <div className={`${currentColors.cardBg} border ${currentColors.border} rounded-xl p-4 shadow-lg backdrop-blur-lg`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ArrowDownOnSquareIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${currentColors.text} mb-1`}>
                Install Harare Metro
              </h3>
              <p className={`text-xs ${currentColors.textMuted} mb-3`}>
                Get the full app experience with offline reading, push notifications, and faster loading.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={installApp}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => {
                    // Hide install prompt (you might want to track this in localStorage)
                    localStorage.setItem('pwa-install-dismissed', 'true')
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${currentColors.categoryButton}`}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className={`${currentColors.cardBg} border border-orange-200 dark:border-orange-700 rounded-xl p-4 shadow-lg backdrop-blur-lg bg-orange-50 dark:bg-orange-900/30`}>
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                You're offline
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-300">
                Showing cached articles. Some images may not load.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <div className={`${currentColors.cardBg} border border-green-200 dark:border-green-700 rounded-xl p-4 shadow-lg backdrop-blur-lg bg-green-50 dark:bg-green-900/30`}>
          <div className="flex items-start gap-3">
            <ArrowPathIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                Update Available
              </h3>
              <p className="text-xs text-green-600 dark:text-green-300 mb-3">
                A new version of Harare Metro is ready with improvements and bug fixes.
              </p>
              <button
                onClick={updateApp}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWAPrompt
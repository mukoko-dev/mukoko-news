// src/components/MobileNavigation.jsx
import React from 'react'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { 
  MagnifyingGlassIcon,
  HomeIcon,
  UserCircleIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import {
  MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
  HomeIcon as HomeSolidIcon,
  UserCircleIcon as UserCircleSolidIcon,
  Squares2X2Icon as Squares2X2SolidIcon
} from '@heroicons/react/24/solid'

const MobileNavigation = ({ 
  currentView,
  onViewChange,
  onSearchClick,
  onProfileClick,
  isAuthenticated = false
}) => {
  const navigation = [
    { 
      id: 'home', 
      name: 'Feed', 
      icon: Squares2X2Icon, 
      iconSolid: Squares2X2SolidIcon,
      onClick: () => onViewChange('home')
    },
    { 
      id: 'search', 
      name: 'Search', 
      icon: MagnifyingGlassIcon, 
      iconSolid: MagnifyingGlassSolidIcon,
      onClick: onSearchClick
    },
    { 
      id: 'profile', 
      name: isAuthenticated ? 'Profile' : 'Sign In', 
      icon: UserCircleIcon, 
      iconSolid: UserCircleSolidIcon,
      onClick: onProfileClick
    }
  ]

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-white/90 dark:bg-black/90 backdrop-blur-md",
      "border-t border-black/10 dark:border-white/10",
      "lg:hidden"
    )}>
      <div className="flex items-center justify-around px-4 py-2">
        {navigation.map((item) => {
          const Icon = currentView === item.id ? item.iconSolid : item.icon
          const isActive = currentView === item.id
          
          return (
            <IconButton
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className={cn(
                "flex flex-col items-center space-y-1 p-2",
                "transition-all duration-200",
                isActive && "text-blue-600 dark:text-blue-400",
                !isActive && "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
              aria-label={item.name}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </IconButton>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavigation
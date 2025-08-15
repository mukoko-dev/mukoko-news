// src/components/HeaderNavigation.jsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { 
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import {
  SunIcon as _SunSolidIcon,
  MoonIcon as _MoonSolidIcon,
  UserCircleIcon as _UserCircleSolidIcon,
  MagnifyingGlassIcon as MagnifyingGlassSolidIcon,
  Squares2X2Icon as Squares2X2SolidIcon,
} from '@heroicons/react/24/solid'
import Logo from './Logo'

const HeaderNavigation = ({ 
  theme, 
  setTheme, 
  onSearchClick, 
  onBytesClick: _onBytesClick,
  onProfileClick,
  onLogout,
  currentView,
  setCurrentView,
  viewMode: _viewMode,
  setViewMode: _setViewMode,
  title: _title = "Mukoko",
  isAuthenticated = false,
  user = null,
  profile = null
}) => {
  const navigation = [
    { id: 'home', name: 'Feed', icon: Squares2X2Icon, iconSolid: Squares2X2SolidIcon },
    { id: 'search', name: 'Search', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassSolidIcon }
  ]

  const handleNavClick = (navId) => {
    setCurrentView?.(navId)
    
    // Trigger appropriate actions
    switch(navId) {
      case 'search':
        onSearchClick?.()
        break
      case 'profile':
        onProfileClick?.()
        break
      case 'home':
        setCurrentView?.('home')
        break
      default:
        break
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme?.(newTheme)
  }

  return (
    <header className={cn(
      "sticky top-0 z-50",
      "bg-white/90 dark:bg-black/90 backdrop-blur-md",
      "border-b border-black/10 dark:border-white/10"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-16">
          
          {/* Mobile: Centered Logo, Desktop: Left Logo */}
          <div className="flex items-center lg:flex-none">
            {/* Mobile: Spacer + Centered Logo */}
            <div className="lg:hidden flex-1 flex justify-center">
              <Logo 
                variant="compact"
                theme={theme}
                size="sm"
                className="flex-shrink-0"
              />
            </div>
            
            {/* Desktop: Horizontal Logo */}
            <div className="hidden lg:block">
              <Logo 
                variant="horizontal"
                theme={theme}
                size="md"
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* Desktop: Center Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = currentView === item.id ? item.iconSolid : item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Desktop: Right Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Theme Toggle */}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </IconButton>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="text-xs">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleNavClick('profile')}>
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavClick('profile')}
                className="flex items-center space-x-2"
              >
                <UserCircleIcon className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>

          {/* Mobile: Right Actions */}
          <div className="flex items-center lg:hidden space-x-2">
            {/* Theme Toggle */}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </IconButton>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('profile')}
                aria-label="Profile"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="text-xs">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </IconButton>
            ) : (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick('profile')}
                aria-label="Sign in"
              >
                <UserCircleIcon className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderNavigation
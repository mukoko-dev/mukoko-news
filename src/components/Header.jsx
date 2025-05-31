import React, { useState } from 'react';
import { MenuIcon, MoonIcon, SunIcon } from '@heroicons/react/outline';

export default function Header({ onMenuClick, isDarkMode, onThemeChange }) {
  return (
    <header className="bg-primary-700 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <img src="/logo-light.svg" alt="Harare Metro" className="h-8 w-auto" />
            <span className="text-xl font-semibold">Harare Metro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onThemeChange}
              className="p-2 hover:bg-primary-600 rounded-full"
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>
            
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-primary-600 rounded-full md:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
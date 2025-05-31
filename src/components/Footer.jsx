import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <img src="/logo-dark.svg" alt="Harare Metro" className="h-8 w-auto inline-block" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your source for Zimbabwe's latest news
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a
              href="https://twitter.com/hararemetro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              Twitter
            </a>
            <a
              href="https://facebook.com/hararemetro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600"
            >
              Facebook
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Harare Metro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
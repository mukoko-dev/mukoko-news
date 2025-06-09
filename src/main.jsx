import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx loaded')

// Ensure the root element exists before trying to render
const rootElement = document.getElementById('root')

if (rootElement) {
  // Only create root once and render
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  console.error('Root element not found. Make sure you have a div with id="root" in your HTML.')
}
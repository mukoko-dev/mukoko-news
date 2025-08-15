import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Performance measurement
const startTime = window.performance?.now() || 0

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

// Log page load time
window.addEventListener('load', () => {
  if (window.performance?.now) {
    const _loadTime = window.performance.now() - startTime
    // Page loaded successfully
  }
})
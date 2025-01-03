import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('Root element not found')
  }
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('App mounted successfully')
} catch (error) {
  console.error('Failed to render app:', error)
}
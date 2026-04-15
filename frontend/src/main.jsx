import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-elevated)',
            color:      'var(--text-primary)',
            border:     '1px solid var(--border-accent)',
            borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontSize:   '14px',
            boxShadow:  '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: { iconTheme: { primary: 'var(--accent-1)', secondary: 'white' } },
          error:   { iconTheme: { primary: '#f87171',         secondary: 'white' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)

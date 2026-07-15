import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

import './styles/global.css'
import './styles/layout.css'
import './styles/home.css'
import './styles/sidebar.css'
import './styles/categories.css'
import './styles/activity.css'
import './styles/auth.css'
import './styles/interactive.css'
import './styles/export.css'
import './styles/skeleton.css'
import './styles/empty-state.css'
import './styles/ui.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
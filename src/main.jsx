import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

import './styles/global.css'
import './styles/layout.css'
import './styles/home.css'
import './styles/sidebar.css'
import './styles/categories.css'
import './styles/activity.css'
import './styles/auth.css'
import './styles/interactive.css'
import './styles/export.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
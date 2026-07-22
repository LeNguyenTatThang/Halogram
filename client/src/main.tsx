import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/i18n.ts'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { CallProvider } from './context/CallContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <CallProvider>
          <App />
        </CallProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)

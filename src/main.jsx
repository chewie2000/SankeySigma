import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SigmaClientProvider } from '@sigmacomputing/plugin'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SigmaClientProvider>
      <App />
    </SigmaClientProvider>
  </StrictMode>,
)

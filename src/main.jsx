import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SigmaClientProvider, client } from '@sigmacomputing/plugin'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SigmaClientProvider client={client}>
      <App />
    </SigmaClientProvider>
  </StrictMode>,
)

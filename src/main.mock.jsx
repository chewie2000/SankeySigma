import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SigmaClientProvider } from '@sigmacomputing/plugin'
import App from './App.jsx'
import { MOCK_STATE } from './mock/data.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SigmaClientProvider mockState={MOCK_STATE}>
      <App />
    </SigmaClientProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import { LenisProvider } from './providers/LenisProvider.tsx'
import { QueryProvider } from './providers/QueryProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <LenisProvider>
          <App />
        </LenisProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
)

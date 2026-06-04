import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.tsx'

import { LenisProvider } from './providers/LenisProvider.tsx'
import { QueryProvider } from './providers/QueryProvider.tsx'

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

if (userPoolId && clientId) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
      },
    },
  });
} else {
  console.warn("AWS Cognito configuration is missing. Authentication features will not work.");
}

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

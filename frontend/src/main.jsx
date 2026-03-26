// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider, useAuth } from './context/AuthContext' // useAuth ni import qiling
import { SocketProvider } from './context/SocketContext'

// Wrapper komponent
function SocketProviderWrapper() {
  const { user } = useAuth(); // LocalStorage emas, Context'dan oling

  return (
    <SocketProvider user={user}>
      <App />
    </SocketProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProviderWrapper />
    </AuthProvider>
  </StrictMode>,
)
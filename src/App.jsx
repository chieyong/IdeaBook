import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Balk from './components/Balk'
import { AuthProvider, useAuth } from './context/AuthContext'
import DetailPage from './pages/DetailPage'
import InstellenPage from './pages/InstellenPage'
import LijstPage from './pages/LijstPage'
import LoginPage from './pages/LoginPage'
import VangenPage from './pages/VangenPage'

function Binnenkant() {
  const { isGeconfigureerd, bezig, sessie, logUit, gebruiker } = useAuth()

  if (!isGeconfigureerd) return <InstellenPage />
  if (bezig) return <div className="midden"><p className="hint">Even geduld…</p></div>
  if (!sessie) return <LoginPage />

  return (
    <BrowserRouter>
      <div className="app">
        <main className="inhoud">
          <Routes>
            <Route path="/" element={<VangenPage />} />
            <Route path="/ideeen" element={<LijstPage />} />
            <Route path="/idee/:id" element={<DetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <p className="hint" style={{ marginTop: '3rem', textAlign: 'center' }}>
            Ingelogd als {gebruiker.email} ·{' '}
            <button className="knop-kaal" type="button" onClick={logUit}>
              uitloggen
            </button>
          </p>
        </main>
        <Balk />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Binnenkant />
    </AuthProvider>
  )
}

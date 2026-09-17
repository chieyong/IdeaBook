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
  if (bezig)
    return (
      <div className="midden">
        <p className="hint">Even geduld…</p>
      </div>
    )
  if (!sessie) return <LoginPage />

  return (
    <BrowserRouter>
      <div className="app">
        <header className="merkbalk">
          <span className="merk">
            Vonkenboek<span className="merk-punt">.</span>
          </span>
          <span className="stempel">Est. 1 idee / 5 sec</span>
        </header>

        <main className="inhoud">
          <Routes>
            <Route path="/" element={<VangenPage />} />
            <Route path="/ideeen" element={<LijstPage />} />
            <Route path="/idee/:id" element={<DetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <div className="voetregel">
            <span className="stempel">{gebruiker.email}</span>
            <button className="knop-kaal" type="button" onClick={logUit}>
              Uitloggen
            </button>
          </div>
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

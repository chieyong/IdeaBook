import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Balk from './components/Balk'
import Leader from './components/Leader'
import { AuthProvider, useAuth } from './context/AuthContext'
import AccountPage from './pages/AccountPage'
import DetailPage from './pages/DetailPage'
import InstellenPage from './pages/InstellenPage'
import HerstelPage from './pages/HerstelPage'
import LijstPage from './pages/LijstPage'
import LoginPage from './pages/LoginPage'
import VangenPage from './pages/VangenPage'

function Binnenkant() {
  const { isGeconfigureerd, bezig, sessie, herstelModus, gebruiker } = useAuth()

  if (!isGeconfigureerd) return <InstellenPage />
  if (bezig)
    return (
      <div className="midden">
        <p className="hint">Even geduld…</p>
      </div>
    )
  // Via een herstelmail binnengekomen: eerst een wachtwoord, dan pas de app.
  if (herstelModus) return <HerstelPage />
  if (!sessie) return <LoginPage />

  return (
    <BrowserRouter>
      <div className="app">
        <header className="merkbalk">
          <span className="merk">
            SparkBook<span className="merk-punt">.</span>
          </span>
          <span className="stempel">Est. 1 idee / 5 sec</span>
        </header>

        <main className="inhoud">
          <Routes>
            <Route path="/" element={<VangenPage />} />
            <Route path="/ideeen" element={<LijstPage />} />
            <Route path="/idee/:id" element={<DetailPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <div className="voetregel">
            <span className="stempel">{gebruiker.email}</span>
            <Link className="knop-kaal" to="/account">
              Account
            </Link>
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
      <Leader />
      <Binnenkant />
    </AuthProvider>
  )
}

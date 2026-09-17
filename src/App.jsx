import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Balk from './components/Balk'
import Leader from './components/Leader'
import TaalKnop from './components/TaalKnop'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TaalProvider, useTaal } from './context/TaalContext'
import AccountPage from './pages/AccountPage'
import DetailPage from './pages/DetailPage'
import HerstelPage from './pages/HerstelPage'
import InstellenPage from './pages/InstellenPage'
import LijstPage from './pages/LijstPage'
import LoginPage from './pages/LoginPage'
import VangenPage from './pages/VangenPage'

function Binnenkant() {
  const { isGeconfigureerd, bezig, sessie, herstelModus } = useAuth()
  const { t } = useTaal()

  if (!isGeconfigureerd) return <InstellenPage />
  if (bezig)
    return (
      <div className="midden">
        <p className="hint">{t('algemeen.geduld')}</p>
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
          <TaalKnop />
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
            <Link className="knop-kaal" to="/account">
              {t('account.account')}
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
    <TaalProvider>
      <AuthProvider>
        <Leader />
        <Binnenkant />
      </AuthProvider>
    </TaalProvider>
  )
}

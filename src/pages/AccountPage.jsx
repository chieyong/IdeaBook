import { Link } from 'react-router-dom'
import WachtwoordFormulier from '../components/WachtwoordFormulier'
import { useAuth } from '../context/AuthContext'

export default function AccountPage() {
  const { gebruiker, logUit } = useAuth()

  return (
    <>
      <Link to="/" className="terug">
        ← Vangen
      </Link>

      <header className="hero">
        <span className="stempel">Account / 003</span>
        <h1 className="hero-titel hero-titel-klein">{gebruiker.email}</h1>
      </header>

      <section className="sectie">
        <div className="sectie-kop">
          <h2>Wachtwoord</h2>
        </div>
        <p className="uitleg" style={{ marginBottom: '1rem' }}>
          Met een wachtwoord log je in de app zelf in. Dat scheelt de omweg via je
          mail, die je op je telefoon in de browser laat uitkomen in plaats van in
          de app.
        </p>
        <WachtwoordFormulier knoptekst="Bewaar wachtwoord" />
      </section>

      <section className="sectie">
        <div className="sectie-kop">
          <h2>Sessie</h2>
        </div>
        <button className="knop knop-stil" type="button" onClick={logUit} style={{ width: '100%' }}>
          Uitloggen
        </button>
      </section>
    </>
  )
}

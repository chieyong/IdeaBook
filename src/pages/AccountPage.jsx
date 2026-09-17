import { Link } from 'react-router-dom'
import WachtwoordFormulier from '../components/WachtwoordFormulier'
import { useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'

export default function AccountPage() {
  const { gebruiker, logUit } = useAuth()
  const { t } = useTaal()

  return (
    <>
      <Link to="/" className="terug">
        {t('account.terug')}
      </Link>

      <h1 className="hero-titel hero-titel-klein">{gebruiker.email}</h1>

      <section className="sectie">
        <div className="sectie-kop">
          <h2>{t('account.wachtwoord')}</h2>
        </div>
        <WachtwoordFormulier knoptekst={t('ww.bewaar')} />
      </section>

      <section className="sectie">
        <button className="knop knop-stil" type="button" onClick={logUit} style={{ width: '100%' }}>
          {t('account.uitloggen')}
        </button>
      </section>
    </>
  )
}

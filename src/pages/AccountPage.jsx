import { Link } from 'react-router-dom'
import WachtwoordFormulier from '../components/WachtwoordFormulier'
import { useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'
import { THEMAS, useThema } from '../context/ThemaContext'
import { TALEN } from '../lib/teksten'

export default function AccountPage() {
  const { gebruiker, logUit } = useAuth()
  const { t, taal, setTaal } = useTaal()
  const { thema, setThema } = useThema()

  return (
    <>
      <Link to="/" className="terug">
        {t('account.terug')}
      </Link>

      <h1 className="hero-titel hero-titel-klein">{gebruiker.email}</h1>

      <section className="sectie">
        <div className="sectie-kop">
          <h2>{t('weergave.kop')}</h2>
        </div>

        <div className="veldgroep">
          <span className="stempel">{t('weergave.thema')}</span>
          <div className="chips" role="group" aria-label={t('weergave.thema')}>
            {THEMAS.map((keuze) => (
              <button
                key={keuze}
                type="button"
                className="chip"
                aria-pressed={thema === keuze}
                onClick={() => setThema(keuze)}
              >
                {t(`thema.${keuze}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="veldgroep">
          <span className="stempel">{t('weergave.taal')}</span>
          <div className="chips" role="group" aria-label={t('weergave.taal')}>
            {TALEN.map((code) => (
              <button
                key={code}
                type="button"
                className="chip"
                aria-pressed={taal === code}
                onClick={() => setTaal(code)}
              >
                {code === 'nl' ? 'Nederlands' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </section>

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

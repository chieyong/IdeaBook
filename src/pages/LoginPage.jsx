import { useState } from 'react'
import TaalKnop from '../components/TaalKnop'
import { useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'

export default function LoginPage() {
  const { logInMetWachtwoord, stuurMagicLink, stuurHerstelmail } = useAuth()
  const { t } = useTaal()
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [bezig, setBezig] = useState(null)
  const [melding, setMelding] = useState(null)
  const [fout, setFout] = useState(null)

  async function probeer(soort, actie) {
    setBezig(soort)
    setFout(null)
    setMelding(null)
    try {
      await actie()
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(null)
    }
  }

  function inloggen(event) {
    event.preventDefault()
    probeer('inloggen', () => logInMetWachtwoord(email.trim(), wachtwoord))
  }

  // Beide mails hebben een adres nodig; vragen is duidelijker dan een lege mail.
  function metEmail(soort, actie, bevestiging) {
    const adres = email.trim()
    if (!adres) {
      setMelding(null)
      setFout(t('login.vulEmail'))
      return
    }
    probeer(soort, async () => {
      await actie(adres)
      setMelding(bevestiging)
    })
  }

  return (
    <div className="midden">
      <div className="paneel">
        <h1 className="hero-titel">
          <span>Spark</span>
          <span className="vaag">Book</span>
        </h1>
        <p className="uitleg" style={{ marginTop: '0.75rem' }}>
          {t('login.tagline')}
        </p>

        <form onSubmit={inloggen} style={{ marginTop: '1.75rem' }}>
          <div className="veldgroep">
            <label className="stempel" htmlFor="email">
              {t('login.email')}
            </label>
            <input
              className="veld"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="veldgroep">
            <label className="stempel" htmlFor="wachtwoord">
              {t('login.wachtwoord')}
            </label>
            <input
              className="veld"
              id="wachtwoord"
              name="password"
              type="password"
              value={wachtwoord}
              onChange={(event) => setWachtwoord(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="knop"
            type="submit"
            disabled={bezig !== null}
            style={{ marginTop: '0.9rem', width: '100%' }}
          >
            {bezig === 'inloggen' ? t('login.bezig') : t('login.inloggen')}
          </button>
        </form>

        <div className="knoprij">
          <button
            className="knop-kaal"
            type="button"
            disabled={bezig !== null}
            onClick={() => metEmail('herstel', stuurHerstelmail, t('login.herstelVerstuurd'))}
          >
            {t('login.vergeten')}
          </button>
          <button
            className="knop-kaal"
            type="button"
            disabled={bezig !== null}
            onClick={() => metEmail('link', stuurMagicLink, t('login.linkVerstuurd'))}
          >
            {t('login.link')}
          </button>
        </div>

        {melding && <p className="melding">{melding}</p>}
        {fout && <p className="fout">{fout}</p>}

        <div className="paneel-voet">
          <TaalKnop />
        </div>
      </div>
    </div>
  )
}

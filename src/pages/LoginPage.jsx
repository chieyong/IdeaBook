import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { logInMetWachtwoord, stuurMagicLink, stuurHerstelmail } = useAuth()
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
      setFout('Vul eerst je e-mailadres in.')
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
        <span className="stempel">Toegang / 000</span>
        <h1 className="hero-titel">
          <span>Vonken</span>
          <span className="vaag">boek</span>
        </h1>
        <p className="uitleg" style={{ marginTop: '1rem' }}>
          Vang je ideeën binnen vijf seconden. Ordenen komt later.
        </p>

        <form onSubmit={inloggen} style={{ marginTop: '1.75rem' }}>
          <div className="veldgroep">
            <label className="stempel" htmlFor="email">
              E-mailadres
            </label>
            <input
              className="veld"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jij@voorbeeld.nl"
              autoComplete="email"
              required
            />
          </div>

          <div className="veldgroep">
            <label className="stempel" htmlFor="wachtwoord">
              Wachtwoord
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
            {bezig === 'inloggen' ? 'Inloggen…' : 'Log in'}
          </button>
        </form>

        <div className="knoprij">
          <button
            className="knop-kaal"
            type="button"
            disabled={bezig !== null}
            onClick={() =>
              metEmail(
                'herstel',
                stuurHerstelmail,
                'Check je mail: daarmee stel je een (nieuw) wachtwoord in.',
              )
            }
          >
            Wachtwoord instellen of vergeten
          </button>
          <button
            className="knop-kaal"
            type="button"
            disabled={bezig !== null}
            onClick={() =>
              metEmail('link', stuurMagicLink, 'Check je mail: je hebt een inloglink gekregen.')
            }
          >
            Liever een inloglink
          </button>
        </div>

        {melding && <p className="melding">{melding}</p>}
        {fout && <p className="fout">{fout}</p>}
      </div>
    </div>
  )
}

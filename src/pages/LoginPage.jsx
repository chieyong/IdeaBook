import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { stuurMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [bezig, setBezig] = useState(false)
  const [verstuurd, setVerstuurd] = useState(false)
  const [fout, setFout] = useState(null)

  async function versturen(event) {
    event.preventDefault()
    setBezig(true)
    setFout(null)
    try {
      await stuurMagicLink(email.trim())
      setVerstuurd(true)
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="midden">
      <div>
        <h1>Vonkenboek</h1>
        <p className="uitleg" style={{ marginTop: '0.35rem' }}>
          Vang je ideeën binnen vijf seconden. Ordenen komt later.
        </p>

        {verstuurd ? (
          <p className="melding">
            Check je mail: je hebt een inloglink gekregen op <strong>{email}</strong>.
          </p>
        ) : (
          <form onSubmit={versturen} style={{ marginTop: '1.5rem' }}>
            <input
              className="veld"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jij@voorbeeld.nl"
              aria-label="E-mailadres"
              autoComplete="email"
              required
            />
            <button className="knop" type="submit" disabled={bezig} style={{ marginTop: '0.6rem', width: '100%' }}>
              {bezig ? 'Versturen…' : 'Stuur me een inloglink'}
            </button>
          </form>
        )}
        {fout && <p className="fout">{fout}</p>}
      </div>
    </div>
  )
}

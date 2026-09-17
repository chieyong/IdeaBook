import { useState } from 'react'
import { MINIMALE_WACHTWOORDLENGTE, useAuth } from '../context/AuthContext'

/**
 * Een nieuw wachtwoord kiezen. Gebruikt op twee plekken: na een herstelmail en
 * op de accountpagina. Twee velden, zodat een typefout je niet buitensluit.
 */
export default function WachtwoordFormulier({ knoptekst = 'Bewaar wachtwoord', onKlaar }) {
  const { zetWachtwoord } = useAuth()
  const [wachtwoord, setWachtwoord] = useState('')
  const [herhaling, setHerhaling] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState(null)
  const [gelukt, setGelukt] = useState(false)

  const teKort = wachtwoord.length > 0 && wachtwoord.length < MINIMALE_WACHTWOORDLENGTE
  const verschilt = herhaling.length > 0 && wachtwoord !== herhaling
  const magVerzenden =
    wachtwoord.length >= MINIMALE_WACHTWOORDLENGTE && wachtwoord === herhaling && !bezig

  async function versturen(event) {
    event.preventDefault()
    if (!magVerzenden) return
    setBezig(true)
    setFout(null)
    try {
      await zetWachtwoord(wachtwoord)
      setWachtwoord('')
      setHerhaling('')
      setGelukt(true)
      onKlaar?.()
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }

  return (
    <form onSubmit={versturen}>
      <div className="veldgroep">
        <label className="stempel" htmlFor="nieuw-wachtwoord">
          Nieuw wachtwoord
        </label>
        <input
          className="veld"
          id="nieuw-wachtwoord"
          name="new-password"
          type="password"
          value={wachtwoord}
          onChange={(event) => {
            setWachtwoord(event.target.value)
            setGelukt(false)
          }}
          autoComplete="new-password"
          minLength={MINIMALE_WACHTWOORDLENGTE}
          required
        />
      </div>

      <div className="veldgroep">
        <label className="stempel" htmlFor="herhaal-wachtwoord">
          Nog een keer
        </label>
        <input
          className="veld"
          id="herhaal-wachtwoord"
          name="confirm-password"
          type="password"
          value={herhaling}
          onChange={(event) => {
            setHerhaling(event.target.value)
            setGelukt(false)
          }}
          autoComplete="new-password"
          required
        />
      </div>

      <p className="hint" style={{ marginTop: '0.7rem' }}>
        Minstens {MINIMALE_WACHTWOORDLENGTE} tekens
      </p>

      <button className="knop" type="submit" disabled={!magVerzenden} style={{ marginTop: '0.8rem', width: '100%' }}>
        {bezig ? 'Bewaren…' : knoptekst}
      </button>

      {teKort && <p className="fout">Nog te kort: minstens {MINIMALE_WACHTWOORDLENGTE} tekens.</p>}
      {verschilt && <p className="fout">De twee wachtwoorden zijn niet gelijk.</p>}
      {gelukt && <p className="melding">Je wachtwoord staat klaar.</p>}
      {fout && <p className="fout">{fout}</p>}
    </form>
  )
}

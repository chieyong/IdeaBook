import { useState } from 'react'
import { MINIMALE_WACHTWOORDLENGTE, useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'

/**
 * Een nieuw wachtwoord kiezen. Gebruikt op twee plekken: na een herstelmail en
 * op de accountpagina. Twee velden, zodat een typefout je niet buitensluit.
 */
export default function WachtwoordFormulier({ knoptekst, onKlaar }) {
  const { zetWachtwoord } = useAuth()
  const { t } = useTaal()
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

  // Eén regel die zegt wat er nog mis is, in plaats van losse foutmeldingen.
  const stand = teKort
    ? t('ww.teKort')
    : verschilt
      ? t('ww.verschilt')
      : t('ww.minstens', { n: MINIMALE_WACHTWOORDLENGTE })

  return (
    <form onSubmit={versturen}>
      <div className="veldgroep">
        <label className="stempel" htmlFor="nieuw-wachtwoord">
          {t('ww.nieuw')}
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
          {t('ww.herhaal')}
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

      <div className="vangen-actie">
        <span className="hint">{stand}</span>
        <button className="knop" type="submit" disabled={!magVerzenden}>
          {bezig ? t('ww.bewaren') : (knoptekst ?? t('ww.bewaar'))}
        </button>
      </div>

      {gelukt && <p className="melding">{t('ww.gelukt')}</p>}
      {fout && <p className="fout">{fout}</p>}
    </form>
  )
}

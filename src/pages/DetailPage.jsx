import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { statusLabel, typeEmoji, typeLabel } from '../lib/constanten'
import { sindsdien, volledigeDatum } from '../lib/datum'
import { haalFragmenten, haalIdee, voegFragmentToe } from '../lib/ideeen'

export default function DetailPage() {
  const { id } = useParams()
  const { userId } = useAuth()
  const [idee, setIdee] = useState(null)
  const [fragmenten, setFragmenten] = useState([])
  const [bezig, setBezig] = useState(true)
  const [fout, setFout] = useState(null)
  const [nieuw, setNieuw] = useState('')
  const [bewaart, setBewaart] = useState(false)

  const laden = useCallback(async () => {
    try {
      const [gevonden, rijen] = await Promise.all([haalIdee(id), haalFragmenten(id)])
      setIdee(gevonden)
      setFragmenten(rijen)
      setFout(null)
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }, [id])

  useEffect(() => {
    laden()
  }, [laden])

  async function bewaarFragment(event) {
    event.preventDefault()
    if (!nieuw.trim() || bewaart) return
    setBewaart(true)
    try {
      const fragment = await voegFragmentToe({ userId, ideaId: id, inhoud: nieuw })
      setFragmenten((vorige) => [...vorige, fragment])
      setNieuw('')
      setFout(null)
    } catch (error) {
      setFout(error.message)
    } finally {
      setBewaart(false)
    }
  }

  if (bezig) return <p className="hint">Laden…</p>
  if (!idee) return <p className="fout">{fout ?? 'Dit idee bestaat niet (meer).'}</p>

  return (
    <>
      <Link to="/ideeen" className="terug">
        ← Ideeën
      </Link>

      <div className="kop">
        <div>
          <h1>{idee.titel}</h1>
          <div className="idee-meta">
            <span className={`label${idee.status === 'vonk' ? ' label-vonk' : ''}`}>
              {statusLabel(idee.status)}
            </span>
            <span>
              {typeEmoji(idee.type)} {typeLabel(idee.type)}
            </span>
            <span>·</span>
            <span title={volledigeDatum(idee.created_at)}>gevangen {sindsdien(idee.created_at)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={bewaarFragment} className="sectie" style={{ marginTop: '1.5rem' }}>
        <textarea
          className="veld"
          value={nieuw}
          onChange={(event) => setNieuw(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) bewaarFragment(event)
          }}
          placeholder="Nieuw fragment — een gedachte, een link, een scène…"
          aria-label="Nieuw fragment"
          rows={3}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
          <span className="hint">Losse fragmenten, geen groot tekstveld.</span>
          <button className="knop" type="submit" disabled={!nieuw.trim() || bewaart}>
            {bewaart ? '…' : 'Toevoegen'}
          </button>
        </div>
      </form>

      {fout && <p className="fout">{fout}</p>}

      <section className="sectie">
        <div className="sectie-kop">
          <h2>Tijdlijn</h2>
          <span className="hint">{fragmenten.length}</span>
        </div>
        {fragmenten.length === 0 ? (
          <p className="leeg">Nog niets uitgewerkt. Voeg je eerste fragment toe.</p>
        ) : (
          <ul className="tijdlijn">
            {fragmenten.map((fragment) => (
              <li key={fragment.id} className="fragment">
                <time className="fragment-tijd" dateTime={fragment.created_at} title={volledigeDatum(fragment.created_at)}>
                  {sindsdien(fragment.created_at)}
                </time>
                {fragment.inhoud && <p className="fragment-inhoud">{fragment.inhoud}</p>}
                {fragment.afbeelding_url && (
                  <img
                    src={fragment.afbeelding_url}
                    alt=""
                    style={{ borderRadius: 'var(--radius)', marginTop: '0.5rem', maxWidth: '100%' }}
                  />
                )}
                {fragment.link && !fragment.inhoud?.includes(fragment.link) && (
                  <a className="fragment-link" href={fragment.link} target="_blank" rel="noreferrer noopener">
                    {fragment.link}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { statusLabel, typeCode, typeLabel } from '../lib/constanten'
import { korteDatum, sindsdien, volledigeDatum } from '../lib/datum'
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
        ← Archief
      </Link>

      <header className="hero">
        <span className="stempel">{typeCode(idee.type)} · Idee</span>
        <h1 className="hero-titel hero-titel-klein">{idee.titel}</h1>

        {/* Typeplaatje: de kerngegevens van dit idee in één oogopslag. */}
        <dl className="specs">
          <div className="spec">
            <dt className="stempel">Status</dt>
            <dd className="spec-waarde">{statusLabel(idee.status)}</dd>
          </div>
          <div className="spec">
            <dt className="stempel">Type</dt>
            <dd className="spec-waarde">{typeLabel(idee.type)}</dd>
          </div>
          <div className="spec">
            <dt className="stempel">Fragmenten</dt>
            <dd className="spec-waarde">{String(fragmenten.length).padStart(2, '0')}</dd>
          </div>
          <div className="spec">
            <dt className="stempel">Gevangen</dt>
            <dd className="spec-waarde" title={volledigeDatum(idee.created_at)}>
              {korteDatum(idee.created_at)}
            </dd>
          </div>
        </dl>
      </header>

      <form onSubmit={bewaarFragment} className="vangen">
        <div className="vangen-kop">
          <span className="stempel">Nieuw fragment</span>
          <span className="stempel vangen-rec">Rec</span>
        </div>
        <textarea
          className="vangen-zin vangen-zin-vrij"
          value={nieuw}
          onChange={(event) => setNieuw(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) bewaarFragment(event)
          }}
          placeholder="Een gedachte, een link, een scène…"
          aria-label="Nieuw fragment"
          rows={3}
          style={{ marginTop: '0.3rem' }}
        />
        <div className="vangen-actie">
          <span className="hint">Losse fragmenten, geen groot tekstveld</span>
          <button className="knop knop-rond" type="submit" disabled={!nieuw.trim() || bewaart}>
            {bewaart ? '…' : '— Voeg toe'}
          </button>
        </div>
      </form>

      {fout && <p className="fout">{fout}</p>}

      <section className="sectie">
        <div className="sectie-kop">
          <h2>Tijdlijn</h2>
          <span className="hint">{String(fragmenten.length).padStart(2, '0')}</span>
        </div>
        {fragmenten.length === 0 ? (
          <p className="leeg">Nog niets uitgewerkt — voeg je eerste fragment toe</p>
        ) : (
          <ul className="tijdlijn">
            {fragmenten.map((fragment) => (
              <li key={fragment.id} className="fragment">
                <time
                  className="fragment-tijd"
                  dateTime={fragment.created_at}
                  title={volledigeDatum(fragment.created_at)}
                >
                  {sindsdien(fragment.created_at)}
                </time>
                {fragment.inhoud && <p className="fragment-inhoud">{fragment.inhoud}</p>}
                {fragment.afbeelding_url && (
                  <img
                    src={fragment.afbeelding_url}
                    alt=""
                    style={{ borderRadius: '14px', marginTop: '0.5rem', maxWidth: '100%' }}
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

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GroeiVeld from '../components/GroeiVeld'
import TypeChips from '../components/TypeChips'
import { useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'
import { STATUSSEN, typeCode } from '../lib/constanten'
import { korteDatum, sindsdien, volledigeDatum } from '../lib/datum'
import {
  haalFragmenten,
  haalIdee,
  verwijderIdee,
  voegFragmentToe,
  werkIdeeBij,
} from '../lib/ideeen'

/** Archiveren is een statuswissel: 'kerkhof' valt buiten de gewone lijst. */
const ARCHIEF = 'kerkhof'
const TERUG_NAAR = 'verkennen'

export default function DetailPage() {
  const { id } = useParams()
  const navigeer = useNavigate()
  const { userId } = useAuth()
  const { t, taal } = useTaal()
  const [idee, setIdee] = useState(null)
  const [fragmenten, setFragmenten] = useState([])
  const [bezig, setBezig] = useState(true)
  const [fout, setFout] = useState(null)
  const [melding, setMelding] = useState(null)
  const [nieuw, setNieuw] = useState('')
  const [bewaart, setBewaart] = useState(false)

  // Bewerken: een kopie die je mag rommelen tot je bewaart.
  const [bewerkt, setBewerkt] = useState(false)
  const [concept, setConcept] = useState(null)
  const [bewaartIdee, setBewaartIdee] = useState(false)
  const [vraagtVerwijderen, setVraagtVerwijderen] = useState(false)

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

  function beginBewerken() {
    setConcept({ titel: idee.titel, type: idee.type, status: idee.status })
    setBewerkt(true)
    setMelding(null)
    setFout(null)
  }

  /** Eén weg naar de database voor bewerken, archiveren en terughalen. */
  async function bewaarVelden(velden, bevestiging) {
    setBewaartIdee(true)
    setFout(null)
    try {
      setIdee(await werkIdeeBij(id, velden))
      setMelding(bevestiging)
      setBewerkt(false)
    } catch (error) {
      setFout(error.message)
    } finally {
      setBewaartIdee(false)
    }
  }

  function bewaarBewerking(event) {
    event.preventDefault()
    const titel = concept.titel.trim()
    if (!titel) {
      setFout(t('detail.titelLeeg'))
      return
    }
    bewaarVelden({ titel, type: concept.type, status: concept.status }, t('detail.opgeslagen'))
  }

  async function verwijderNu() {
    setBewaartIdee(true)
    setFout(null)
    try {
      await verwijderIdee(id)
      navigeer('/ideeen', { replace: true })
    } catch (error) {
      setFout(error.message)
      setBewaartIdee(false)
      setVraagtVerwijderen(false)
    }
  }

  if (bezig) return <p className="hint">{t('algemeen.laden')}</p>
  if (!idee) return <p className="fout">{fout ?? t('detail.weg')}</p>

  const gearchiveerd = idee.status === ARCHIEF

  return (
    <>
      <Link to="/ideeen" className="terug">
        {t('detail.terug')}
      </Link>

      <header className="hero">
        {/* De kicker toont het type; tijdens het bewerken zou die achterlopen. */}
        {!bewerkt && (
          <span className="stempel">
            {typeCode(idee.type)} · {t('detail.idee')}
          </span>
        )}

        {bewerkt ? (
          <form onSubmit={bewaarBewerking}>
            <div className="veldgroep">
              <span className="stempel">{t('detail.titelVeld')}</span>
              <GroeiVeld
                className="vangen-titel"
                waarde={concept.titel}
                onChange={(event) => setConcept({ ...concept, titel: event.target.value })}
                aria-label={t('detail.titelVeld')}
                maxLength={200}
                autoComplete="off"
              />
            </div>

            <div className="veldgroep">
              <span className="stempel">{t('detail.type')}</span>
              <TypeChips waarde={concept.type} onKies={(type) => setConcept({ ...concept, type })} />
            </div>

            <div className="veldgroep">
              <span className="stempel">{t('detail.statusVeld')}</span>
              <div className="chips" role="group" aria-label={t('detail.statusVeld')}>
                {STATUSSEN.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    aria-pressed={concept.status === s}
                    onClick={() => setConcept({ ...concept, status: s })}
                  >
                    {t(`status.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="vangen-actie">
              <button className="knop-kaal" type="button" onClick={() => setBewerkt(false)}>
                {t('detail.annuleer')}
              </button>
              <button className="knop knop-rond" type="submit" disabled={bewaartIdee}>
                {bewaartIdee ? '…' : t('detail.bewaar')}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="hero-titel hero-titel-klein">{idee.titel}</h1>

            {/* Typeplaatje: de kerngegevens van dit idee in één oogopslag. */}
            <dl className="specs">
              <div className="spec">
                <dt className="stempel">{t('detail.status')}</dt>
                <dd className="spec-waarde">{t(`status.${idee.status}`)}</dd>
              </div>
              <div className="spec">
                <dt className="stempel">{t('detail.type')}</dt>
                <dd className="spec-waarde">{t(`type.${idee.type}`)}</dd>
              </div>
              <div className="spec">
                <dt className="stempel">{t('detail.fragmenten')}</dt>
                <dd className="spec-waarde">{String(fragmenten.length).padStart(2, '0')}</dd>
              </div>
              <div className="spec">
                <dt className="stempel">{t('detail.gevangen')}</dt>
                <dd className="spec-waarde" title={volledigeDatum(idee.created_at, taal)}>
                  {korteDatum(idee.created_at, taal)}
                </dd>
              </div>
            </dl>

            {vraagtVerwijderen ? (
              <div className="bevestig">
                <span className="hint">{t('detail.zeker')}</span>
                <div className="bevestig-knoppen">
                  <button
                    className="knop-kaal"
                    type="button"
                    onClick={() => setVraagtVerwijderen(false)}
                  >
                    {t('detail.nee')}
                  </button>
                  <button
                    className="knop knop-gevaar"
                    type="button"
                    onClick={verwijderNu}
                    disabled={bewaartIdee}
                  >
                    {bewaartIdee ? '…' : t('detail.jaVerwijder')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ideeacties">
                <button className="knop-kaal" type="button" onClick={beginBewerken}>
                  {t('detail.bewerken')}
                </button>
                <button
                  className="knop-kaal"
                  type="button"
                  disabled={bewaartIdee}
                  onClick={() =>
                    gearchiveerd
                      ? bewaarVelden({ status: TERUG_NAAR }, t('detail.teruggehaald'))
                      : bewaarVelden({ status: ARCHIEF }, t('detail.gearchiveerd'))
                  }
                >
                  {gearchiveerd ? t('detail.terughalen') : t('detail.archiveer')}
                </button>
                <button
                  className="knop-kaal knop-kaal-gevaar"
                  type="button"
                  onClick={() => setVraagtVerwijderen(true)}
                >
                  {t('detail.verwijder')}
                </button>
              </div>
            )}
          </>
        )}
      </header>

      {melding && <p className="melding">{melding}</p>}
      {fout && <p className="fout">{fout}</p>}

      <form onSubmit={bewaarFragment} className="vangen">
        <div className="vangen-kop">
          <span className="stempel">{t('detail.nieuwFragment')}</span>
          <span className="stempel vangen-rec">{t('kaart.rec')}</span>
        </div>
        <textarea
          className="vangen-zin vangen-zin-vrij"
          value={nieuw}
          onChange={(event) => setNieuw(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) bewaarFragment(event)
          }}
          placeholder={t('detail.fragmentPlaceholder')}
          aria-label={t('detail.nieuwFragment')}
          rows={3}
          style={{ marginTop: '0.3rem' }}
        />
        <div className="vangen-actie vangen-actie-rechts">
          <button className="knop knop-rond" type="submit" disabled={!nieuw.trim() || bewaart}>
            {bewaart ? '…' : t('detail.voegToe')}
          </button>
        </div>
      </form>

      <section className="sectie">
        <div className="sectie-kop">
          <h2>{t('detail.tijdlijn')}</h2>
          <span className="hint">{String(fragmenten.length).padStart(2, '0')}</span>
        </div>
        {fragmenten.length === 0 ? (
          <p className="leeg">{t('detail.leeg')}</p>
        ) : (
          <ul className="tijdlijn">
            {fragmenten.map((fragment) => (
              <li key={fragment.id} className="fragment">
                <time
                  className="fragment-tijd"
                  dateTime={fragment.created_at}
                  title={volledigeDatum(fragment.created_at, taal)}
                >
                  {sindsdien(fragment.created_at, taal)}
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

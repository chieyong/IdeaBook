import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GroeiVeld from './GroeiVeld'
import TypeChips from './TypeChips'
import { useAuth } from '../context/AuthContext'
import { typeCode, typeLabel } from '../lib/constanten'
import { vangIdee, voegFragmentToe, zoekIdeeen } from '../lib/ideeen'

/**
 * Het vanggedeelte. Om structuur wordt hier nooit gevraagd: een titel is
 * genoeg, al het andere is optioneel en met één tik te doen.
 */
export default function VangenKaart({ onOpgeslagen }) {
  const { userId } = useAuth()
  const [modus, setModus] = useState('nieuw')
  const [tekst, setTekst] = useState('')
  const [zin, setZin] = useState('')
  const [type, setType] = useState('overig')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState(null)
  const [gelukt, setGelukt] = useState(null)
  const tekstRef = useRef(null)

  const [zoekterm, setZoekterm] = useState('')
  const [resultaten, setResultaten] = useState([])
  const [zoekt, setZoekt] = useState(false)

  const isNieuw = modus === 'nieuw'

  useEffect(() => {
    tekstRef.current?.focus()
  }, [modus])

  // Zoeken naar een bestaand idee, licht vertraagd zodat we niet per toets zoeken.
  useEffect(() => {
    if (isNieuw || !zoekterm.trim()) {
      setResultaten([])
      return
    }
    setZoekt(true)
    const timer = setTimeout(async () => {
      try {
        setResultaten(await zoekIdeeen(zoekterm))
        setFout(null)
      } catch (error) {
        setFout(error.message)
      } finally {
        setZoekt(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [zoekterm, isNieuw])

  function leegmaken() {
    setTekst('')
    setZin('')
    setType('overig')
    setZoekterm('')
    setResultaten([])
    tekstRef.current?.focus()
  }

  async function bewaarNieuw() {
    if (!tekst.trim() || bezig) return
    setBezig(true)
    setFout(null)
    try {
      const idee = await vangIdee({ userId, titel: tekst, eersteZin: zin, type })
      setGelukt({ tekst: 'Gevangen:', idee })
      leegmaken()
      onOpgeslagen?.()
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }

  async function bewaarBijBestaand(idee) {
    if (bezig) return
    const inhoud = tekst.trim()
    setBezig(true)
    setFout(null)
    try {
      if (inhoud) await voegFragmentToe({ userId, ideaId: idee.id, inhoud })
      setGelukt({ tekst: inhoud ? 'Toegevoegd aan' : 'Geopend:', idee })
      leegmaken()
      onOpgeslagen?.()
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }

  function wissel() {
    setModus(isNieuw ? 'bestaand' : 'nieuw')
    setGelukt(null)
    setFout(null)
  }

  // Enter bewaart; shift+enter maakt een nieuwe regel.
  function bijToets(event) {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    if (isNieuw) bewaarNieuw()
  }

  return (
    <div className="vangen">
      <div className="vangen-kop">
        <span className="stempel">{isNieuw ? 'Nieuw idee' : 'Bestaand idee'}</span>
        <span className="stempel vangen-rec">Rec</span>
      </div>

      <GroeiVeld
        veldRef={tekstRef}
        className="vangen-titel"
        waarde={tekst}
        onChange={(event) => {
          setTekst(event.target.value)
          setGelukt(null)
        }}
        onKeyDown={bijToets}
        placeholder={isNieuw ? 'Wat schiet je te binnen?' : 'Wat wil je toevoegen?'}
        aria-label={isNieuw ? 'Titel van je idee' : 'Tekst van je fragment'}
        enterKeyHint="done"
        autoComplete="off"
      />

      {isNieuw ? (
        <>
          <GroeiVeld
            className="vangen-zin"
            waarde={zin}
            onChange={(event) => setZin(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                bewaarNieuw()
              }
            }}
            placeholder="Eén zin erbij (optioneel)"
            aria-label="Eén zin erbij, optioneel"
          />
          <div className="vangen-voet">
            <span className="stempel vangen-veldnaam">Type</span>
            <TypeChips waarde={type} onKies={setType} />
          </div>
          <div className="vangen-actie">
            <span className="hint">Enter bewaart meteen</span>
            <button
              className="knop knop-rond"
              type="button"
              onClick={bewaarNieuw}
              disabled={!tekst.trim() || bezig}
            >
              {bezig ? '…' : '— Vang'}
            </button>
          </div>
        </>
      ) : (
        <div className="vangen-voet">
          <span className="stempel vangen-veldnaam">Zoeken</span>
          <input
            className="veld"
            value={zoekterm}
            onChange={(event) => setZoekterm(event.target.value)}
            placeholder="Zoek een bestaand idee op titel…"
            aria-label="Zoek een bestaand idee"
            autoComplete="off"
          />
          {zoekterm.trim() && (
            <ul className="zoekresultaten">
              {resultaten.map((idee) => (
                <li key={idee.id}>
                  <button className="zoekresultaat" type="button" onClick={() => bewaarBijBestaand(idee)}>
                    <span className="idee-index" aria-hidden="true">
                      {typeCode(idee.type)}
                    </span>
                    <span>
                      {idee.titel}
                      <br />
                      <span className="hint">{typeLabel(idee.type)}</span>
                    </span>
                  </button>
                </li>
              ))}
              {!zoekt && resultaten.length === 0 && <li className="hint">Niets gevonden</li>}
            </ul>
          )}
        </div>
      )}

      <div className="vangen-wissel">
        <button className="knop-kaal" type="button" onClick={wissel}>
          {isNieuw ? 'Toevoegen aan bestaand idee' : 'Toch een nieuw idee'}
        </button>
      </div>

      {gelukt && (
        <p className="melding">
          {gelukt.tekst} <Link to={`/idee/${gelukt.idee.id}`}>{gelukt.idee.titel}</Link>
        </p>
      )}
      {fout && <p className="fout">{fout}</p>}
    </div>
  )
}

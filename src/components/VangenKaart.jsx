import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GroeiVeld from './GroeiVeld'
import TypeChips from './TypeChips'
import { useAuth } from '../context/AuthContext'
import { useTaal } from '../context/TaalContext'
import { typeCode } from '../lib/constanten'
import { vangIdee, voegFragmentToe, zoekIdeeen } from '../lib/ideeen'

/**
 * Het vanggedeelte. Om structuur wordt hier nooit gevraagd: een titel is
 * genoeg, al het andere is optioneel en met één tik te doen.
 */
export default function VangenKaart({ onOpgeslagen }) {
  const { userId } = useAuth()
  const { t } = useTaal()
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
      return undefined
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
      setGelukt({ tekst: t('kaart.gevangen'), idee })
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
      setGelukt({ tekst: inhoud ? t('kaart.toegevoegd') : t('kaart.geopend'), idee })
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
        <span className="stempel">{isNieuw ? t('kaart.nieuw') : t('kaart.bestaand')}</span>
        <span className="stempel vangen-rec">{t('kaart.rec')}</span>
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
        placeholder={isNieuw ? t('kaart.titelNieuw') : t('kaart.titelBestaand')}
        aria-label={isNieuw ? t('kaart.nieuw') : t('kaart.bestaand')}
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
            placeholder={t('kaart.zin')}
            aria-label={t('kaart.zin')}
          />
          <div className="vangen-voet">
            <span className="stempel vangen-veldnaam">{t('kaart.type')}</span>
            <TypeChips waarde={type} onKies={setType} />
          </div>
          <div className="vangen-actie">
            <span className="hint">{t('kaart.enter')}</span>
            <button
              className="knop knop-rond"
              type="button"
              onClick={bewaarNieuw}
              disabled={!tekst.trim() || bezig}
            >
              {bezig ? '…' : t('kaart.vang')}
            </button>
          </div>
        </>
      ) : (
        <div className="vangen-voet">
          <span className="stempel vangen-veldnaam">{t('kaart.zoeken')}</span>
          <input
            className="veld"
            value={zoekterm}
            onChange={(event) => setZoekterm(event.target.value)}
            placeholder={t('kaart.zoekPlaceholder')}
            aria-label={t('kaart.zoeken')}
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
                    <span>{idee.titel}</span>
                  </button>
                </li>
              ))}
              {!zoekt && resultaten.length === 0 && <li className="hint">{t('kaart.nietsGevonden')}</li>}
            </ul>
          )}
        </div>
      )}

      <div className="vangen-wissel">
        <button className="knop-kaal" type="button" onClick={wissel}>
          {isNieuw ? t('kaart.bestaand') : t('kaart.nieuw')}
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

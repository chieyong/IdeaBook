import { useEffect, useRef, useState } from 'react'

/**
 * De aanloop, zoals het startstuk van een filmrol: dradenkruis, rondgaande veeg
 * en een aftelling. Speelt één keer per keer dat de app geladen wordt.
 *
 * Vangen moet snel kunnen, dus hij is kort en met één tik over te slaan. Wie
 * minder beweging wil ziet hem helemaal niet.
 */

// Module-niveau, zodat een remount (of StrictMode) hem niet opnieuw afspeelt.
let alGespeeld = false

const GETALLEN = ['3', '2', '1']
const TIK = 260
const MERK = 320
const UITDOVEN = 220

const STAP_MERK = GETALLEN.length // na de getallen: alleen het woordmerk
const STAP_UIT = STAP_MERK + 1 // en dan uitdoven

const wilGeenBeweging = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export default function Leader() {
  const [stap, setStap] = useState(() => (alGespeeld || wilGeenBeweging() ? null : 0))
  const klokken = useRef([])

  useEffect(() => {
    if (stap === null) return undefined
    alGespeeld = true

    let verstreken = 0
    const plan = (wacht, doe) => {
      verstreken += wacht
      klokken.current.push(setTimeout(doe, verstreken))
    }
    GETALLEN.forEach((_, i) => plan(TIK, () => setStap(i + 1)))
    plan(MERK, () => setStap(STAP_UIT))
    plan(UITDOVEN, () => setStap(null))

    const klaar = klokken.current
    return () => klaar.forEach(clearTimeout)
    // Bewust alleen bij het opzetten: de stappen lopen daarna op hun eigen klok.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function overslaan() {
    klokken.current.forEach(clearTimeout)
    klokken.current = [setTimeout(() => setStap(null), UITDOVEN)]
    setStap(STAP_UIT)
  }

  if (stap === null) return null
  const uit = stap >= STAP_UIT

  return (
    <div className="leader" data-uit={uit} onPointerDown={overslaan} role="presentation" aria-hidden="true">
      <div className="leader-mark">
        <svg viewBox="0 0 100 100" className="leader-tekening">
          <path className="leader-veeg" d="M50 50 L50 20 A30 30 0 0 1 80 50 Z" />
          <circle className="leader-ring" cx="50" cy="50" r="34" />
          <line className="leader-kruis" x1="0" y1="50" x2="100" y2="50" />
          <line className="leader-kruis" x1="50" y1="0" x2="50" y2="100" />
        </svg>
        {stap < STAP_MERK && (
          <span className="leader-getal" key={stap}>
            {GETALLEN[stap]}
          </span>
        )}
      </div>
      <span className="leader-merk" data-aan={stap >= STAP_MERK}>
        SparkBook
      </span>
    </div>
  )
}

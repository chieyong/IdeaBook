import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { TALEN, vertaal } from '../lib/teksten'

const TaalContext = createContext(null)
const SLEUTEL = 'sparkbook.taal'

/** Eerder gekozen taal, anders die van het apparaat, anders Nederlands. */
function beginTaal() {
  try {
    const bewaard = localStorage.getItem(SLEUTEL)
    if (TALEN.includes(bewaard)) return bewaard
  } catch {
    // Privémodus of geblokkeerde opslag: dan maar de taal van het apparaat.
  }
  const van = navigator.languages?.[0] ?? navigator.language ?? 'nl'
  return van.toLowerCase().startsWith('nl') ? 'nl' : 'en'
}

export function TaalProvider({ children }) {
  const [taal, setTaal] = useState(beginTaal)

  useEffect(() => {
    document.documentElement.lang = taal
    try {
      localStorage.setItem(SLEUTEL, taal)
    } catch {
      // Niet kunnen onthouden is vervelend, maar geen reden om te stoppen.
    }
  }, [taal])

  const waarde = useMemo(
    () => ({ taal, setTaal, t: (sleutel, waarden) => vertaal(taal, sleutel, waarden) }),
    [taal],
  )

  return <TaalContext.Provider value={waarde}>{children}</TaalContext.Provider>
}

export function useTaal() {
  const context = useContext(TaalContext)
  if (!context) throw new Error('useTaal moet binnen een TaalProvider gebruikt worden')
  return context
}

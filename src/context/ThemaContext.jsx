import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemaContext = createContext(null)
// Ook gelezen door het scriptje in index.html, dat het attribuut al vóór de
// eerste verf zet. Verander je deze sleutel, verander hem daar dan ook.
const SLEUTEL = 'sparkbook.thema'

export const THEMAS = ['systeem', 'licht', 'donker']

function beginThema() {
  try {
    const bewaard = localStorage.getItem(SLEUTEL)
    if (THEMAS.includes(bewaard)) return bewaard
  } catch {
    // Privémodus of geblokkeerde opslag: dan volgen we gewoon het systeem.
  }
  return 'systeem'
}

/**
 * De browser kiest de eerste theme-color die past. Door er zelf één vooraan te
 * zetten winnen we van de twee mediaregels in index.html; halen we hem weg, dan
 * nemen die het weer over.
 */
function zetStatusbalk(thema) {
  const bestaande = document.querySelector('meta[data-thema-kleur]')
  if (thema === 'systeem') {
    bestaande?.remove()
    return
  }
  const meta = bestaande ?? document.createElement('meta')
  meta.setAttribute('name', 'theme-color')
  meta.setAttribute('data-thema-kleur', '')
  meta.setAttribute('content', thema === 'donker' ? '#131312' : '#e7e2d5')
  if (!bestaande) document.head.prepend(meta)
}

export function ThemaProvider({ children }) {
  const [thema, setThema] = useState(beginThema)

  useEffect(() => {
    // Geen attribuut bij 'systeem': dan beslist prefers-color-scheme alleen.
    if (thema === 'systeem') document.documentElement.removeAttribute('data-thema')
    else document.documentElement.setAttribute('data-thema', thema)
    zetStatusbalk(thema)
    try {
      localStorage.setItem(SLEUTEL, thema)
    } catch {
      // Niet kunnen onthouden is vervelend, maar geen reden om te stoppen.
    }
  }, [thema])

  const waarde = useMemo(() => ({ thema, setThema }), [thema])
  return <ThemaContext.Provider value={waarde}>{children}</ThemaContext.Provider>
}

export function useThema() {
  const context = useContext(ThemaContext)
  if (!context) throw new Error('useThema moet binnen een ThemaProvider gebruikt worden')
  return context
}

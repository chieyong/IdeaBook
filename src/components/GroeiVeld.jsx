import { useEffect, useRef } from 'react'

/**
 * Textarea die meegroeit met de inhoud, zodat een lange titel nooit uit beeld
 * schuift tijdens het vangen.
 */
export default function GroeiVeld({ waarde, veldRef, ...rest }) {
  const eigenRef = useRef(null)
  const ref = veldRef ?? eigenRef

  useEffect(() => {
    const veld = ref.current
    if (!veld) return
    veld.style.height = 'auto'
    veld.style.height = `${veld.scrollHeight}px`
  }, [waarde, ref])

  return <textarea ref={ref} value={waarde} rows={1} {...rest} />
}

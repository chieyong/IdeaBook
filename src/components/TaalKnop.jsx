import { TALEN } from '../lib/teksten'
import { useTaal } from '../context/TaalContext'

/** NL | EN — klein genoeg om in de merkbalk te passen. */
export default function TaalKnop() {
  const { taal, setTaal } = useTaal()

  return (
    <div className="taalknop" role="group" aria-label="Taal / Language">
      {TALEN.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={taal === code}
          onClick={() => setTaal(code)}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

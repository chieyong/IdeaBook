import { useEffect, useState } from 'react'
import IdeeKaart from '../components/IdeeKaart'
import { STATUSSEN, TYPES } from '../lib/constanten'
import { haalIdeeen } from '../lib/ideeen'

export default function LijstPage() {
  const [type, setType] = useState('alle')
  const [status, setStatus] = useState('alle')
  const [ideeen, setIdeeen] = useState([])
  const [bezig, setBezig] = useState(true)
  const [fout, setFout] = useState(null)

  useEffect(() => {
    let actief = true
    setBezig(true)
    haalIdeeen({ type, status })
      .then((rijen) => {
        if (!actief) return
        setIdeeen(rijen)
        setFout(null)
      })
      .catch((error) => actief && setFout(error.message))
      .finally(() => actief && setBezig(false))
    return () => {
      actief = false
    }
  }, [type, status])

  return (
    <>
      <div className="kop">
        <div>
          <h1>Ideeën</h1>
          <p>
            {bezig ? 'Laden…' : `${ideeen.length} ${ideeen.length === 1 ? 'idee' : 'ideeën'}`}
          </p>
        </div>
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="Filter op type">
          <button className="chip" aria-pressed={type === 'alle'} onClick={() => setType('alle')}>
            Alle types
          </button>
          {TYPES.map((t) => (
            <button
              key={t.waarde}
              className="chip"
              aria-pressed={type === t.waarde}
              onClick={() => setType(t.waarde)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Filter op status">
          <button className="chip" aria-pressed={status === 'alle'} onClick={() => setStatus('alle')}>
            Actief
          </button>
          {STATUSSEN.map((s) => (
            <button
              key={s.waarde}
              className="chip"
              aria-pressed={status === s.waarde}
              onClick={() => setStatus(s.waarde)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {fout && <p className="fout">{fout}</p>}
      {!bezig && ideeen.length === 0 && !fout && <p className="leeg">Geen ideeën met dit filter.</p>}

      <ul className="lijst">
        {ideeen.map((idee) => (
          <IdeeKaart key={idee.id} idee={idee} />
        ))}
      </ul>
    </>
  )
}

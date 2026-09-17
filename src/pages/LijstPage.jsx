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
      <header className="hero">
        <span className="stempel">Archief / 002</span>
        <h1 className="hero-titel">
          <span>Alle</span>
          <span className="vaag">ideeën</span>
        </h1>
        <div className="teller">
          <span className="teller-getal">{bezig ? '··' : String(ideeen.length).padStart(2, '0')}</span>
          <span className="stempel">{ideeen.length === 1 ? 'idee gevonden' : 'ideeën gevonden'}</span>
        </div>
      </header>

      <div className="filters">
        <div className="filterrij">
          <span className="stempel">Type</span>
          <div className="chips" role="group" aria-label="Filter op type">
            <button className="chip" aria-pressed={type === 'alle'} onClick={() => setType('alle')}>
              Alle
            </button>
            {TYPES.map((t) => (
              <button
                key={t.waarde}
                className="chip"
                aria-pressed={type === t.waarde}
                onClick={() => setType(t.waarde)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filterrij">
          <span className="stempel">Status</span>
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
      </div>

      {fout && <p className="fout">{fout}</p>}
      {!bezig && ideeen.length === 0 && !fout && <p className="leeg">Geen ideeën met dit filter</p>}

      <ul className="lijst">
        {ideeen.map((idee, i) => (
          <IdeeKaart key={idee.id} idee={idee} index={i + 1} />
        ))}
      </ul>
    </>
  )
}

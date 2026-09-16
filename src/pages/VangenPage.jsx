import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VangenKaart from '../components/VangenKaart'
import IdeeKaart from '../components/IdeeKaart'
import { haalInbox } from '../lib/ideeen'

export default function VangenPage() {
  const [inbox, setInbox] = useState([])
  const [bezig, setBezig] = useState(true)
  const [fout, setFout] = useState(null)

  const laden = useCallback(async () => {
    try {
      setInbox(await haalInbox())
      setFout(null)
    } catch (error) {
      setFout(error.message)
    } finally {
      setBezig(false)
    }
  }, [])

  useEffect(() => {
    laden()
  }, [laden])

  return (
    <>
      <div className="kop">
        <div>
          <h1>Vonkenboek</h1>
          <p>Vangen kan altijd. Ordenen komt later.</p>
        </div>
      </div>

      <VangenKaart onOpgeslagen={laden} />

      <section className="sectie">
        <div className="sectie-kop">
          <h2>Inbox</h2>
          <Link className="knop-kaal" to="/ideeen">
            Alles bekijken
          </Link>
        </div>
        {fout && <p className="fout">{fout}</p>}
        {!bezig && inbox.length === 0 && !fout && (
          <p className="leeg">Nog geen vonken. Typ hierboven je eerste idee.</p>
        )}
        <ul className="lijst">
          {inbox.map((idee) => (
            <IdeeKaart key={idee.id} idee={idee} />
          ))}
        </ul>
      </section>
    </>
  )
}

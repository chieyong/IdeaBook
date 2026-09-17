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
      <header className="hero">
        <span className="stempel">Vangen / 001</span>
        <h1 className="hero-titel">
          <span>Vang</span>
          <span>elke</span>
          <span className="vaag">vonk</span>
        </h1>
        <p className="hero-zin">Vangen kan altijd. Ordenen komt later.</p>
      </header>

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
          <p className="leeg">Nog geen vonken — typ hierboven je eerste idee</p>
        )}
        <ul className="lijst">
          {inbox.map((idee, i) => (
            <IdeeKaart key={idee.id} idee={idee} index={i + 1} />
          ))}
        </ul>
      </section>
    </>
  )
}

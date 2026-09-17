import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VangenKaart from '../components/VangenKaart'
import IdeeKaart from '../components/IdeeKaart'
import { useTaal } from '../context/TaalContext'
import { haalInbox } from '../lib/ideeen'

export default function VangenPage() {
  const { t } = useTaal()
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
      <h1 className="hero-titel">
        <span>{t('vangen.kop1')}</span>
        <span>{t('vangen.kop2')}</span>
        <span className="vaag">{t('vangen.kop3')}</span>
      </h1>

      <VangenKaart onOpgeslagen={laden} />

      <section className="sectie">
        <div className="sectie-kop">
          <h2>{t('vangen.inbox')}</h2>
          <Link className="knop-kaal" to="/ideeen">
            {t('vangen.alles')}
          </Link>
        </div>
        {fout && <p className="fout">{fout}</p>}
        {!bezig && inbox.length === 0 && !fout && <p className="leeg">{t('vangen.leeg')}</p>}
        <ul className="lijst">
          {inbox.map((idee, i) => (
            <IdeeKaart key={idee.id} idee={idee} index={i + 1} />
          ))}
        </ul>
      </section>
    </>
  )
}

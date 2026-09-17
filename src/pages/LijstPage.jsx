import { useEffect, useState } from 'react'
import IdeeKaart from '../components/IdeeKaart'
import { useTaal } from '../context/TaalContext'
import { STATUSSEN, TYPES } from '../lib/constanten'
import { haalIdeeen } from '../lib/ideeen'

export default function LijstPage() {
  const { t } = useTaal()
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
        <h1 className="hero-titel">
          <span>{t('lijst.kop1')}</span>
          <span className="vaag">{t('lijst.kop2')}</span>
        </h1>
        <div className="teller">
          <span className="teller-getal">{bezig ? '··' : String(ideeen.length).padStart(2, '0')}</span>
          <span className="stempel">{t('lijst.eenheid')}</span>
        </div>
      </header>

      <div className="filters">
        <div className="filterrij">
          <span className="stempel">{t('filter.type')}</span>
          <div className="chips" role="group" aria-label={t('filter.type')}>
            <button className="chip" aria-pressed={type === 'alle'} onClick={() => setType('alle')}>
              {t('filter.alle')}
            </button>
            {TYPES.map((s) => (
              <button
                key={s.waarde}
                className="chip"
                aria-pressed={type === s.waarde}
                onClick={() => setType(s.waarde)}
              >
                {t(`type.${s.waarde}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="filterrij">
          <span className="stempel">{t('filter.status')}</span>
          <div className="chips" role="group" aria-label={t('filter.status')}>
            <button className="chip" aria-pressed={status === 'alle'} onClick={() => setStatus('alle')}>
              {t('filter.actief')}
            </button>
            {STATUSSEN.map((s) => (
              <button
                key={s}
                className="chip"
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
              >
                {t(`status.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {fout && <p className="fout">{fout}</p>}
      {!bezig && ideeen.length === 0 && !fout && <p className="leeg">{t('lijst.leeg')}</p>}

      <ul className="lijst">
        {ideeen.map((idee, i) => (
          <IdeeKaart key={idee.id} idee={idee} index={i + 1} />
        ))}
      </ul>
    </>
  )
}

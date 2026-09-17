import { NavLink } from 'react-router-dom'
import { useTaal } from '../context/TaalContext'

const klasse = ({ isActive }) => (isActive ? 'actief' : undefined)

/** Zwevende capsule onderin: vangen is altijd binnen één tik bereikbaar. */
export default function Balk() {
  const { t } = useTaal()

  return (
    <nav className="balk" aria-label="SparkBook">
      <div className="balk-binnen">
        <NavLink to="/" className={klasse} end>
          <span className="balk-icoon" aria-hidden="true" />
          {t('nav.vangen')}
        </NavLink>
        <NavLink to="/ideeen" className={klasse}>
          <span className="balk-icoon" aria-hidden="true" />
          {t('nav.ideeen')}
        </NavLink>
      </div>
    </nav>
  )
}

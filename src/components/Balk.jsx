import { NavLink } from 'react-router-dom'

const klasse = ({ isActive }) => (isActive ? 'actief' : undefined)

/** Zwevende capsule onderin: vangen is altijd binnen één tik bereikbaar. */
export default function Balk() {
  return (
    <nav className="balk" aria-label="Hoofdnavigatie">
      <div className="balk-binnen">
        <NavLink to="/" className={klasse} end>
          <span className="balk-icoon" aria-hidden="true" />
          Vangen
        </NavLink>
        <NavLink to="/ideeen" className={klasse}>
          <span className="balk-icoon" aria-hidden="true" />
          Ideeën
        </NavLink>
      </div>
    </nav>
  )
}

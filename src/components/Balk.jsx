import { NavLink } from 'react-router-dom'

const klasse = ({ isActive }) => (isActive ? 'actief' : undefined)

/** Vaste balk onderin: vangen is altijd binnen één tik bereikbaar. */
export default function Balk() {
  return (
    <nav className="balk" aria-label="Hoofdnavigatie">
      <div className="balk-binnen">
        <NavLink to="/" className={klasse} end>
          <span className="balk-icoon" aria-hidden="true">
            ✨
          </span>
          Vangen
        </NavLink>
        <NavLink to="/ideeen" className={klasse}>
          <span className="balk-icoon" aria-hidden="true">
            📚
          </span>
          Ideeën
        </NavLink>
      </div>
    </nav>
  )
}

import { Link } from 'react-router-dom'
import { statusLabel, typeCode } from '../lib/constanten'
import { sindsdien } from '../lib/datum'

/** Eén regel uit de lijst, met volgnummer als op een typeplaatje. */
export default function IdeeKaart({ idee, index }) {
  return (
    <li>
      <Link to={`/idee/${idee.id}`} className="idee-kaart">
        <span className="idee-index" aria-hidden="true">
          {typeof index === 'number' ? String(index).padStart(2, '0') : '··'}
        </span>
        <h3>{idee.titel}</h3>
        <div className="idee-meta">
          <span className={`label${idee.status === 'vonk' ? ' label-vonk' : ''}`}>
            {statusLabel(idee.status)}
          </span>
          <span>{typeCode(idee.type)}</span>
          <span aria-hidden="true">/</span>
          <span>{sindsdien(idee.updated_at)}</span>
        </div>
      </Link>
    </li>
  )
}

import { Link } from 'react-router-dom'
import { statusLabel, typeEmoji, typeLabel } from '../lib/constanten'
import { sindsdien } from '../lib/datum'

export default function IdeeKaart({ idee }) {
  return (
    <li>
      <Link to={`/idee/${idee.id}`} className="idee-kaart">
        <h3>{idee.titel}</h3>
        <div className="idee-meta">
          <span className={`label${idee.status === 'vonk' ? ' label-vonk' : ''}`}>
            {statusLabel(idee.status)}
          </span>
          <span>
            {typeEmoji(idee.type)} {typeLabel(idee.type)}
          </span>
          <span>·</span>
          <span>{sindsdien(idee.updated_at)}</span>
        </div>
      </Link>
    </li>
  )
}

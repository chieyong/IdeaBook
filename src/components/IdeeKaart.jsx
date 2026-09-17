import { Link } from 'react-router-dom'
import { typeCode } from '../lib/constanten'
import { sindsdien } from '../lib/datum'
import { useTaal } from '../context/TaalContext'

/** Eén regel uit de lijst, met volgnummer als op een typeplaatje. */
export default function IdeeKaart({ idee, index }) {
  const { t, taal } = useTaal()

  return (
    <li>
      <Link to={`/idee/${idee.id}`} className="idee-kaart">
        <span className="idee-index" aria-hidden="true">
          {typeof index === 'number' ? String(index).padStart(2, '0') : '··'}
        </span>
        <h3>{idee.titel}</h3>
        <div className="idee-meta">
          <span className={`label${idee.status === 'vonk' ? ' label-vonk' : ''}`}>
            {t(`status.${idee.status}`)}
          </span>
          <span>{typeCode(idee.type)}</span>
          <span aria-hidden="true">/</span>
          <span>{sindsdien(idee.updated_at, taal)}</span>
        </div>
      </Link>
    </li>
  )
}

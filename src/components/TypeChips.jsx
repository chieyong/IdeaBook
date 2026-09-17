import { TYPES } from '../lib/constanten'

/** Type kiezen met één tik. Nooit verplicht: 'overig' is de standaard. */
export default function TypeChips({ waarde, onKies }) {
  return (
    <div className="chips" role="group" aria-label="Type idee">
      {TYPES.map((type) => (
        <button
          key={type.waarde}
          type="button"
          className="chip"
          aria-pressed={waarde === type.waarde}
          onClick={() => onKies(type.waarde)}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}

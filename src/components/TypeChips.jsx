import { TYPES } from '../lib/constanten'
import { useTaal } from '../context/TaalContext'

/** Type kiezen met één tik. Nooit verplicht: 'overig' is de standaard. */
export default function TypeChips({ waarde, onKies }) {
  const { t } = useTaal()

  return (
    <div className="chips" role="group" aria-label={t('kaart.type')}>
      {TYPES.map((type) => (
        <button
          key={type.waarde}
          type="button"
          className="chip"
          aria-pressed={waarde === type.waarde}
          onClick={() => onKies(type.waarde)}
        >
          {t(`type.${type.waarde}`)}
        </button>
      ))}
    </div>
  )
}

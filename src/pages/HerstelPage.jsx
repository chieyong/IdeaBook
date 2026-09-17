import WachtwoordFormulier from '../components/WachtwoordFormulier'
import { useTaal } from '../context/TaalContext'

/** Getoond als je via een herstelmail binnenkomt: eerst een wachtwoord kiezen. */
export default function HerstelPage() {
  const { t } = useTaal()

  return (
    <div className="midden">
      <div className="paneel">
        <h1 className="hero-titel">
          <span>{t('herstel.kop1')}</span>
          <span className="vaag">{t('herstel.kop2')}</span>
        </h1>
        <div style={{ marginTop: '1.5rem' }}>
          <WachtwoordFormulier knoptekst={t('ww.gaVerder')} />
        </div>
      </div>
    </div>
  )
}

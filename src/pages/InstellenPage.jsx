import TaalKnop from '../components/TaalKnop'
import { useTaal } from '../context/TaalContext'

/** Getoond zolang de Supabase-omgevingsvariabelen nog ontbreken. */
export default function InstellenPage() {
  const { t } = useTaal()

  return (
    <div className="midden">
      <div className="paneel">
        <h1 className="hero-titel">
          <span>{t('instellen.kop1')}</span>
          <span className="vaag">{t('instellen.kop2')}</span>
        </h1>
        <p className="uitleg" style={{ marginTop: '0.75rem' }}>
          {t('instellen.uitleg')}
        </p>
        <pre className="veld" style={{ overflowX: 'auto', fontSize: '0.7rem' }}>
          <code>
            VITE_SUPABASE_URL=…{'\n'}
            VITE_SUPABASE_ANON_KEY=…
          </code>
        </pre>
        <p className="uitleg">{t('instellen.netlify')}</p>

        <div className="paneel-voet">
          <TaalKnop />
        </div>
      </div>
    </div>
  )
}

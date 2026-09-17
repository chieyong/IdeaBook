/** Getoond zolang de Supabase-omgevingsvariabelen nog ontbreken. */
export default function InstellenPage() {
  return (
    <div className="midden">
      <div className="paneel">
        <span className="stempel">Setup / 000</span>
        <h1 className="hero-titel">
          <span>Bijna</span>
          <span className="vaag">klaar</span>
        </h1>
        <p className="uitleg" style={{ marginTop: '1rem' }}>
          SparkBook mist nog de verbinding met Supabase. Maak een <code>.env</code> aan (kopie van{' '}
          <code>.env.example</code>) met:
        </p>
        <pre className="veld" style={{ overflowX: 'auto', fontSize: '0.7rem' }}>
          <code>
            VITE_SUPABASE_URL=…{'\n'}
            VITE_SUPABASE_ANON_KEY=…
          </code>
        </pre>
        <p className="uitleg">
          Op Netlify zet je dezelfde twee variabelen bij <em>Site configuration → Environment variables</em>. Zie
          de README voor de volledige stappen.
        </p>
      </div>
    </div>
  )
}

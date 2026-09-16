/** Getoond zolang de Supabase-omgevingsvariabelen nog ontbreken. */
export default function InstellenPage() {
  return (
    <div className="midden">
      <div>
        <h1>Bijna klaar</h1>
        <p className="uitleg">
          Vonkenboek mist nog de verbinding met Supabase. Maak een <code>.env</code> aan (kopie van{' '}
          <code>.env.example</code>) met:
        </p>
        <pre className="veld" style={{ overflowX: 'auto', fontSize: '0.8rem' }}>
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

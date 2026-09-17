import WachtwoordFormulier from '../components/WachtwoordFormulier'

/** Getoond als je via een herstelmail binnenkomt: eerst een wachtwoord kiezen. */
export default function HerstelPage() {
  return (
    <div className="midden">
      <div className="paneel">
        <span className="stempel">Toegang / 001</span>
        <h1 className="hero-titel">
          <span>Kies je</span>
          <span className="vaag">wachtwoord</span>
        </h1>
        <p className="uitleg" style={{ marginTop: '1rem' }}>
          Hierna log je in de app zelf in, zonder mail ertussen.
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <WachtwoordFormulier knoptekst="Bewaar en ga verder" />
        </div>
      </div>
    </div>
  )
}

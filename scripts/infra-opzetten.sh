#!/usr/bin/env bash
#
# Zet de infrastructuur voor Vonkenboek op met de Supabase CLI en de Netlify CLI.
# Draai dit op je eigen machine (de browser-login werkt niet in een container).
#
#   ./scripts/infra-opzetten.sh [supabase-project-ref] [netlify-site-naam]
#
# Zonder argumenten gebruikt het script het project uit STANDAARD_REF hieronder.
#
# Elke stap die iets aanmaakt of wijzigt vraagt eerst om bevestiging.
# De service_role key wordt nergens gebruikt: die hoort niet in een frontend.

set -euo pipefail

# Het Supabase-project van Vonkenboek: https://jkiipthtwgzpvoagyqte.supabase.co
# Een project-ref is niet geheim; hij zit ook in de frontend-bundel.
STANDAARD_REF="jkiipthtwgzpvoagyqte"

PROJECT_REF="${1:-$STANDAARD_REF}"
SITE_NAAM="${2:-vonkenboek}"
WORTEL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORTEL"

if [[ ! "$PROJECT_REF" =~ ^[a-z]{20}$ ]]; then
  cat >&2 <<UITLEG
"$PROJECT_REF" ziet er niet uit als een project-ref (twintig kleine letters).

Gebruik: ./scripts/infra-opzetten.sh [supabase-project-ref] [netlify-site-naam]

De ref is het stukje uit je Supabase-URL: https://<project-ref>.supabase.co,
te vinden onder Project Settings > General.
UITLEG
  exit 1
fi

blauw() { printf '\n\033[1;34m== %s\033[0m\n' "$*"; }
grijs() { printf '   \033[2m%s\033[0m\n' "$*"; }

bevestig() {
  read -r -p "   -> $1 [j/N] " antwoord
  [[ "$antwoord" == "j" || "$antwoord" == "J" ]]
}

# ---------------------------------------------------------------- stap 0 ----
blauw "Stap 0 — controleren of de gereedschappen er zijn"

ontbreekt=0
for programma in supabase netlify; do
  if command -v "$programma" >/dev/null 2>&1; then
    grijs "$programma gevonden: $("$programma" --version 2>&1 | head -1)"
  else
    echo "   ONTBREEKT: $programma" >&2
    ontbreekt=1
  fi
done
if [[ "$ontbreekt" == 1 ]]; then
  cat >&2 <<'UITLEG'

Installeren:
  supabase   brew install supabase/tap/supabase   (of: npm i -g supabase)
  netlify    npm install -g netlify-cli
UITLEG
  exit 1
fi

blauw "Stap 0b — controleren of je ingelogd bent"
if supabase projects list >/dev/null 2>&1; then
  grijs "Supabase: ingelogd."
else
  echo "   Supabase: NIET ingelogd. Draai eerst:  supabase login" >&2
  exit 1
fi
if netlify status >/dev/null 2>&1; then
  grijs "Netlify: $(netlify status 2>/dev/null | grep -i 'email' | head -1 | tr -s ' ')"
else
  echo "   Netlify: NIET ingelogd. Draai eerst:  netlify login" >&2
  exit 1
fi

# ---------------------------------------------------------------- stap 1 ----
blauw "Stap 1 — het Supabase-project koppelen"
grijs "Koppelt deze map aan https://$PROJECT_REF.supabase.co"
grijs "Wijzigt niets aan je database; dat gebeurt pas in stap 2."
grijs "Je databasewachtwoord wordt gevraagd (of zet SUPABASE_DB_PASSWORD)."
if bevestig "koppelen?"; then
  supabase link --project-ref "$PROJECT_REF"
else
  echo "   Overgeslagen — de rest heeft de koppeling nodig, dus ik stop." >&2
  exit 1
fi

# ---------------------------------------------------------------- stap 2 ----
blauw "Stap 2 — de migraties uitvoeren"
grijs "Voert supabase/migrations/*.sql uit op het gekoppelde project:"
grijs "tabellen idea, fragment en idea_link, Row Level Security, storage-bucket."
supabase migration list || true
if bevestig "migraties uitvoeren?"; then
  supabase db push
else
  grijs "Overgeslagen."
fi

# ---------------------------------------------------------------- stap 3 ----
blauw "Stap 3 — auth-URL's zetten vanuit supabase/config.toml"
grijs "site_url en de redirect-URL's (localhost + $SITE_NAAM.netlify.app):"
grep -E 'site_url|localhost|netlify\.app' supabase/config.toml | sed 's/^/     /'
if [[ "$SITE_NAAM" != "vonkenboek" ]]; then
  grijs "Sitenaam wijkt af; ik pas het domein in config.toml aan naar $SITE_NAAM."
  if bevestig "config.toml aanpassen?"; then
    sed -i.bak "s/vonkenboek\.netlify\.app/${SITE_NAAM}.netlify.app/g" supabase/config.toml
    rm -f supabase/config.toml.bak
  fi
fi
grijs "config.toml declareert alleen deze twee instellingen; al het andere op"
grijs "het project blijft zoals het is. Eerst het verschil met wat er nu staat:"
supabase config diff || true
if bevestig "deze auth-instellingen naar Supabase pushen?"; then
  supabase config push
else
  grijs "Overgeslagen."
fi

# ---------------------------------------------------------------- stap 4 ----
blauw "Stap 4 — de sleutels ophalen"
grijs "Alleen de publieke (anon/publishable) key. Zonder --reveal toont de CLI de"
grijs "geheime sleutels sowieso niet voluit, en die vlag gebruiken we bewust niet."
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY="$(
  supabase projects api-keys --project-ref "$PROJECT_REF" --output json |
    node -e '
      let ruw = ""
      process.stdin.on("data", (d) => (ruw += d))
      process.stdin.on("end", () => {
        const lijst = JSON.parse(ruw)
        const sleutels = Array.isArray(lijst) ? lijst : (lijst.keys ?? [])
        const naam = (s) => String(s.name ?? s.type ?? "").toLowerCase()
        const waarde = (s) => String(s.api_key ?? s.apiKey ?? s.key ?? "")
        // Geheime sleutels vallen af, ook als de CLI ze ooit zou meesturen.
        const geheim = /service_role|secret/
        // Voorkeur voor de legacy anon-key: die werkt met elke supabase-js.
        const publiek =
          sleutels.find((s) => naam(s) === "anon" && !geheim.test(naam(s))) ??
          sleutels.find((s) => naam(s).includes("publishable"))
        if (!publiek) { console.error("geen publieke key in het antwoord"); process.exit(1) }
        const key = waarde(publiek)
        if (!key || key.includes("*")) { console.error("key is afgeschermd of leeg"); process.exit(1) }
        process.stdout.write(key)
      })
    '
)"
if [[ -z "$ANON_KEY" ]]; then
  echo "   Kon de publieke key niet ophalen. Pak hem handmatig uit Project Settings > API." >&2
  exit 1
fi
grijs "URL:  $SUPABASE_URL"
grijs "Key:  ${ANON_KEY:0:12}… (publiek, mag in de frontend)"

if [[ ! -f .env ]]; then
  if bevestig "een lokale .env aanmaken met deze waarden?"; then
    printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$SUPABASE_URL" "$ANON_KEY" > .env
    grijs ".env geschreven (staat in .gitignore)."
  fi
else
  grijs ".env bestaat al — die laat ik met rust."
fi

# ---------------------------------------------------------------- stap 5 ----
blauw "Stap 5 — de Netlify-site"
if [[ -f .netlify/state.json ]]; then
  grijs "Deze map is al aan een Netlify-site gekoppeld:"
  netlify status 2>/dev/null | sed 's/^/     /' | head -8
else
  grijs "Maakt een nieuwe site aan met de naam '$SITE_NAAM' en koppelt deze map eraan."
  if bevestig "site aanmaken?"; then
    netlify sites:create --name "$SITE_NAAM" || netlify link --name "$SITE_NAAM"
  else
    grijs "Overgeslagen."
  fi
fi

# ---------------------------------------------------------------- stap 6 ----
blauw "Stap 6 — de GitHub-repo koppelen voor automatische deploys"
grijs "Hiervoor is een interactieve GitHub-autorisatie nodig: 'netlify init'"
grijs "vraagt toegang en zet de build-hook. Het kan ook in de Netlify-UI onder"
grijs "Site configuration > Build & deploy > Link repository."
if bevestig "nu 'netlify init' draaien?"; then
  netlify init
else
  grijs "Overgeslagen — je kunt dit later doen zonder iets kwijt te raken."
fi

# ---------------------------------------------------------------- stap 7 ----
blauw "Stap 7 — de omgevingsvariabelen bij Netlify zetten"
grijs "VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY (geen service_role key)."
if bevestig "variabelen zetten?"; then
  netlify env:set VITE_SUPABASE_URL "$SUPABASE_URL"
  netlify env:set VITE_SUPABASE_ANON_KEY "$ANON_KEY"
  netlify env:list
fi

# ---------------------------------------------------------------- stap 8 ----
blauw "Stap 8 — bouwen en deployen"
grijs "npm run build en daarna een productie-deploy vanuit dist/."
if bevestig "nu deployen?"; then
  netlify deploy --build --prod
fi

blauw "Klaar"
cat <<UITLEG
   Controleer nog even in het Supabase-dashboard:
   - Authentication > Providers > Email staat aan (magic links).
   - Authentication > URL Configuration toont nu je Netlify-adres en localhost.
   - Zet 'Allow new users to sign up' uit zodra je zelf bent ingelogd.
UITLEG

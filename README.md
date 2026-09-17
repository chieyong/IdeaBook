# Vonkenboek

Een persoonlijke app om ideeën vast te leggen: app-ideeën, korte films, projectjes.
Het uitgangspunt: **vangen moet binnen vijf seconden kunnen, ordenen komt later.**
Bij het invoeren vraagt de app nooit om structuur.

React + Vite · Supabase (database, magic-link login, storage) · PWA · Netlify.

## Wat er nu in zit (fase 1)

- **Vangen** — één veld voor je idee, optioneel één zin erbij. Enter bewaart meteen.
- **Type met één tik** — App, Film, Project of Overig; standaard is `overig`.
- **Toevoegen aan bestaand idee** — zoek op titel en je tekst wordt een fragment op dat idee.
- **Inbox** — alles wat je vangt krijgt status `vonk` en verschijnt op het startscherm.
- **Overzicht** — alle ideeën, te filteren op type en status.
- **Detailpagina** — tijdlijn van losse fragmenten, met een veld om er een bij te zetten.
- **PWA** — manifest en service worker, dus installeerbaar op je homescreen.
- Licht en donker thema via `prefers-color-scheme`, mobile-first.

Fase 2 (sjablonen, status, tags, scores, matrix) en fase 3 (review, herontdek,
kerkhof, koppelen) zitten er nog niet in; het datamodel houdt er wel al rekening mee.

## Zelf opstarten

```bash
npm install
cp .env.example .env     # vul je Supabase-gegevens in
npm run dev
```

## Infrastructuur opzetten met de CLI's

Er is een script dat alle stappen achter elkaar doet en voor elke wijziging om
bevestiging vraagt. Draai het op je eigen machine: `supabase login` en
`netlify login` openen een browser, dus in een container werken ze niet.

```bash
brew install supabase/tap/supabase     # of zonder installatie: npx supabase (npm -g wordt niet ondersteund)
npm install -g netlify-cli
supabase login
netlify login

./scripts/infra-opzetten.sh
```

Het Supabase-project (`jkiipthtwgzpvoagyqte`) zit al als standaard in het script,
dus zonder argumenten doet het het goede. Een ander project of een andere
sitenaam geef je mee als argumenten:

```bash
./scripts/infra-opzetten.sh <supabase-project-ref> [netlify-site-naam]
```

Het script controleert eerst of beide CLI's er zijn en of je bent ingelogd, en
loopt dan langs: project koppelen → migraties uitvoeren → auth-URL's pushen
vanuit `supabase/config.toml` → publieke sleutel ophalen → Netlify-site aanmaken
→ GitHub-repo koppelen → `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` zetten
→ deployen. De `service_role` key wordt nergens aangeraakt; die hoort niet in een
frontend en niet in een Netlify-buildvariabele.

Eén ding kan het script niet zelf:

- **De GitHub-koppeling** volledig automatisch leggen: `netlify init` vraagt
  interactief om toegang tot je GitHub-account. Je kunt het ook in de Netlify-UI
  doen onder *Site configuration → Build & deploy → Link repository*.

De auth-URL's staan in `supabase/config.toml` en gaan met `supabase config push`
naar het project. Heet je site anders dan `sparkbook-vizcraft`, geef die naam dan als
tweede argument mee — het script past het domein dan overal aan.

Let op bij dat bestand: `config push` overschrijft precies die instellingen die
erin staan, en laat de rest ongemoeid. Daarom staan er bewust alleen `site_url`
en `additional_redirect_urls` in. Zet je er meer in (bijvoorbeeld `enable_signup`),
dan draai je bij elke push ook terug wat je in het dashboard hebt aangepast. Het
script toont eerst `supabase config diff`, zodat je ziet wat er verandert voordat
je ja zegt.

Liever met de hand? Hieronder staat dezelfde configuratie stap voor stap; dat is
de route die dit project volgt. Het script en `supabase/config.toml` blijven
staan voor als je het later alsnog wilt automatiseren.

## Wat je in Supabase instelt

1. **Project aanmaken** op [supabase.com](https://supabase.com) (regio Frankfurt ligt het dichtst bij).
2. **Schema laden.** Open *SQL Editor*, plak de inhoud van
   `supabase/migrations/20260916090000_init.sql` en voer die uit. Dat maakt de
   tabellen `idea`, `fragment` en `idea_link`, zet Row Level Security aan en maakt
   de storage-bucket `fragment-afbeeldingen` (die pas vanaf fase 2 gebruikt wordt).
   Werk je met de Supabase CLI, dan doet `supabase db push` hetzelfde.
3. **Sleutels overnemen.** *Project Settings → API*: kopieer de `anon public` key
   naar je `.env`. De URL staat al vast:

   ```
   VITE_SUPABASE_URL=https://jkiipthtwgzpvoagyqte.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   De anon-key mag in de frontend staan; RLS bewaakt de data. De `service_role`
   key hoort hier nooit in.
4. **Auth instellen.** *Authentication → Providers → Email*: zet "Email" aan.
   Magic links werken standaard; wachtwoorden heb je niet nodig.
5. **Redirect-URL's.** *Authentication → URL Configuration*:
   - `Site URL`: je Netlify-adres, bijvoorbeeld `https://sparkbook-vizcraft.netlify.app`
   - `Redirect URLs`: deze vier toevoegen —

     ```
     http://localhost:5173
     http://localhost:4173
     https://sparkbook-vizcraft.netlify.app
     https://*--sparkbook-vizcraft.netlify.app
     ```

     `5173` is `npm run dev`, `4173` is `npm run preview` (waar je de service
     worker test), en de laatste regel vangt de deploy previews af.

   De app stuurt `window.location.origin` mee als redirect, dus elk adres dat je
   gebruikt moet in die lijst staan — anders kom je na het klikken op de mail-link
   op de verkeerde plek uit.
6. **Alleen jijzelf?** Zet in *Authentication → Sign In / Up* "Allow new users to
   sign up" uit nadat je één keer bent ingelogd. Dan kan niemand anders een account
   maken op jouw project.

## Wat je in Netlify instelt

1. **Site koppelen** aan de GitHub-repo. Build command en publish directory staan al
   in `netlify.toml` (`npm run build` → `dist`), inclusief de SPA-redirect die nodig
   is omdat de app client-side routes gebruikt zoals `/idee/<id>`.
2. **Environment variables** (*Site configuration → Environment variables*):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Deze worden tijdens de build ingebakken, dus na het wijzigen ervan moet je
   opnieuw deployen.
3. **Adres kiezen** en dat adres in Supabase invullen bij `Site URL` (stap 5 hierboven).

Daarna kun je de site op je telefoon openen en via *Deel → Zet op beginscherm*
installeren. De service worker wordt alleen in een productiebuild geactiveerd;
lokaal testen doe je met `npm run build && npm run preview`.

## Structuur

```
src/
  components/   VangenKaart, IdeeKaart, TypeChips, Balk, GroeiVeld
  context/      AuthContext (sessie + magic link)
  lib/          supabase-client, datatoegang (ideeen.js), constanten, datumopmaak
  pages/        Vangen, Lijst, Detail, Login, Instellen
supabase/
  migrations/   SQL-schema met RLS
supabase/
  config.toml   auth-instellingen (site-URL en redirect-URL's) voor `supabase config push`
scripts/
  genereer-iconen.mjs   maakt de PWA-iconen opnieuw (geen dependencies nodig)
  infra-opzetten.sh     zet Supabase en Netlify op via de CLI's, stap voor stap
```

## Afwijkingen van het oorspronkelijke datamodel

- `fragment` heeft ook een `user_id`. Dat is strikt genomen dubbel (het idee weet
  al van wie het is), maar de RLS-regels worden er simpeler en sneller van: geen
  join nodig bij elke query.
- `idea_link` heeft een `user_id` en de regel `idea_a < idea_b`, zodat dezelfde
  koppeling niet twee keer kan bestaan (A→B en B→A).
- `tags` en `sjabloon_antwoorden` hebben `not null` met een lege standaardwaarde,
  zodat je in de app nooit op `null` hoeft te controleren.

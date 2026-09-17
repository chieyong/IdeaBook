# SparkBook

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
- **Inloggen met wachtwoord** — je logt in de app zelf in. Een inloglink per mail
  blijft bestaan als terugval; zie *Waarom een wachtwoord* hieronder.
- **Nederlands of Engels** — te wisselen met NL | EN in de merkbalk; de keuze
  blijft bewaard en zonder keuze volgt de app de taal van je apparaat.
- **Aanloop** — een korte filmleader bij het openen: dradenkruis, veeg en aftelling.
- **PWA** — manifest en service worker, dus installeerbaar op je homescreen.
- Licht en donker thema via `prefers-color-scheme`, mobile-first.
- **Retro-vormgeving** — brede mono-displayletters, papier-en-inkt palet, omgekeerde panelen.

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
   Laat "Confirm email" en wachtwoorden op de standaardinstelling staan — de app
   gebruikt zowel het wachtwoord (`signInWithPassword`) als de inloglink
   (`signInWithOtp`) en de herstelmail (`resetPasswordForEmail`).
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
  components/   VangenKaart, IdeeKaart, TypeChips, Balk, GroeiVeld, WachtwoordFormulier, Leader, TaalKnop
  context/      AuthContext (sessie + inloggen), TaalContext (taalkeuze)
  lib/          supabase-client, datatoegang (ideeen.js), constanten, datumopmaak, authfouten, teksten
  pages/        Vangen, Lijst, Detail, Login, Herstel, Account, Instellen
supabase/
  migrations/   SQL-schema met RLS
supabase/
  config.toml   auth-instellingen (site-URL en redirect-URL's) voor `supabase config push`
public/
  fonts/        Martian Mono + Space Grotesk (OFL), meegeleverd voor offline gebruik
  icons/        PWA-iconen
scripts/
  genereer-iconen.mjs   tekent het leadermerk als PWA-iconen (geen dependencies nodig)
  infra-opzetten.sh     zet Supabase en Netlify op via de CLI's, stap voor stap
```

## Waarom een wachtwoord

Op je telefoon is de app een webapp op je beginscherm, en die heeft op iOS zijn
eigen opslag — los van Safari. Klik je op een inloglink in je mail, dan opent die
in Safari en landt de sessie daar. De webapp ziet er niets van en vraagt bij de
volgende keer openen opnieuw om een link. Daarom logt de app in met een
wachtwoord: dat vul je in de app zelf in, dus de sessie komt op de goede plek
terecht en blijft staan.

**De eerste keer.** Je bestaande account heeft nog geen wachtwoord. Twee manieren
om er een te zetten:

- Ben je ergens nog ingelogd (meestal Safari): ga naar *Account* onderaan en kies
  er een.
- Anders: tik op het inlogscherm op *Wachtwoord instellen of vergeten*. Je krijgt
  een mail; via die link kom je op een scherm waar je een wachtwoord kiest.

Daarna log je in de webapp in met e-mail en wachtwoord. iCloud Sleutelhanger en
Google Wachtwoordbeheer vullen het in — de velden hebben de juiste
`autocomplete`-waarden (`email` en `current-password`).

De inloglink blijft bestaan als terugval, onder *Liever een inloglink*.

## Taal

Alle zichtbare tekst staat in `src/lib/teksten.js`, per taal, met platte sleutels
als `vangen.inbox`. Componenten halen hem op met `t('sleutel')` uit
`useTaal()`. Geen bibliotheek: het zijn twee talen en een handvol sleutels.

- De keuze staat in `localStorage` en valt anders terug op `navigator.language`.
- `document.documentElement.lang` volgt mee, en datums ook: `datum.js` maakt zijn
  `Intl`-formatters per taal (`nl-NL` en `en-GB`).
- Statussen en types staan als waarde in de database (`vonk`, `app`) en krijgen
  hun label uit de vertaaltabel. De opgeslagen waarden veranderen dus nooit mee.
- Ook de foutmeldingen van Supabase worden vertaald, in `authfouten.js`.

Een derde taal toevoegen is: een blok bijzetten in `teksten.js`, de code in
`TALEN` en `LOCALES` zetten, klaar.

## Vormgeving

De look is retro-technisch: alsof de app op een apparaat uit de jaren tachtig
draait. Alles zit in `src/styles.css`, er is geen CSS-framework.

- **Letters** — `Martian Mono` (breed, blokkerig, variabel in gewicht én breedte)
  voor koppen, knoppen en labels; `Space Grotesk` voor lopende tekst. Beide staan
  als woff2 in `public/fonts/` met een `@font-face` bovenaan de stylesheet, zodat
  de app offline werkt en er geen verzoek naar een derde partij gaat. Ze vallen
  onder de SIL Open Font License 1.1 (zie `public/fonts/LICENSE.txt`).
- **Palet** — papier (warm beige) en inkt (bijna zwart), met `--diep` als het
  omgekeerde vlak: donker op licht, licht op donker. In donkere modus draaien
  beide om, zodat het contrastpaneel altijd blijft werken. `--vonk` is het enige
  accent en wordt spaarzaam gebruikt.
- **Terugkerende elementen** — de `.stempel` (klein, gesperd, in hoofdletters),
  volgnummers op kaarten (`01`, `02`), het typeplaatje op de detailpagina
  (`.specs`), de ronde actieknop (`.knop-rond`) en de kop die naar onderen
  uitdooft (`.hero-titel .vaag` / `.vager`).
- **Aanloop en icoon** — beide gebruiken hetzelfde leadermerk: een ring met een
  dradenkruis dat tot de rand doorloopt en een rondgaande veeg in `--vonk`. De
  aanloop (`Leader.jsx`) telt af van 3 en duurt ongeveer 1,3 seconde. Hij speelt
  één keer per keer dat de app geladen wordt, is met één tik over te slaan, en
  wordt bij `prefers-reduced-motion` helemaal niet getoond. De app rendert er
  ondertussen al achter, dus hij vertraagt het laden niet — alleen het zicht
  erop. Korter of weg? Pas `TIK`, `MERK` en `UITDOVEN` boven in `Leader.jsx` aan,
  of haal `<Leader />` uit `App.jsx`.
- **Toegankelijkheid** — de uitdovende kop blijft leesbaar (52% en 32% dekking),
  animaties respecteren `prefers-reduced-motion` en focus blijft zichtbaar.

## Afwijkingen van het oorspronkelijke datamodel

- `fragment` heeft ook een `user_id`. Dat is strikt genomen dubbel (het idee weet
  al van wie het is), maar de RLS-regels worden er simpeler en sneller van: geen
  join nodig bij elke query.
- `idea_link` heeft een `user_id` en de regel `idea_a < idea_b`, zodat dezelfde
  koppeling niet twee keer kan bestaan (A→B en B→A).
- `tags` en `sjabloon_antwoorden` hebben `not null` met een lege standaardwaarde,
  zodat je in de app nooit op `null` hoeft te controleren.

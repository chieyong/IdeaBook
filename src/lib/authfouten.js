/**
 * Supabase geeft zijn foutmeldingen in het Engels terug, en niet altijd even
 * begrijpelijk. Dit zijn de meldingen die je bij het inloggen echt tegenkomt.
 * Wat we niet kennen geven we ongewijzigd door: liever een ruwe melding dan
 * geen melding.
 */
const PATRONEN = [
  [/invalid login credentials/i, 'onjuist'],
  [/email not confirmed/i, 'nietBevestigd'],
  [/should be at least (\d+) characters/i, 'teKort'],
  [/different from the old password/i, 'zelfde'],
  [/you can only request this after (\d+) seconds/i, 'wachten'],
  [/email rate limit exceeded/i, 'teVaak'],
  [/user not found/i, 'geenAccount'],
  [/signups not allowed/i, 'geenNieuwe'],
  [/failed to fetch|network/i, 'offline'],
]

const MELDINGEN = {
  nl: {
    onjuist: 'E-mailadres of wachtwoord klopt niet.',
    nietBevestigd: 'Dit e-mailadres is nog niet bevestigd.',
    teKort: 'Kies een wachtwoord van minstens $1 tekens.',
    zelfde: 'Dit is je huidige wachtwoord al.',
    wachten: 'Even wachten: probeer het over $1 seconden opnieuw.',
    teVaak: 'Te veel mails achter elkaar. Probeer het over een minuut opnieuw.',
    geenAccount: 'Geen account met dit e-mailadres.',
    geenNieuwe: 'Nieuwe accounts zijn uitgezet op dit project.',
    offline: 'Geen verbinding met de server. Ben je online?',
  },
  en: {
    onjuist: 'Email or password is incorrect.',
    nietBevestigd: 'This email address has not been confirmed yet.',
    teKort: 'Pick a password of at least $1 characters.',
    zelfde: 'That is already your current password.',
    wachten: 'Hold on: try again in $1 seconds.',
    teVaak: 'Too many emails in a row. Try again in a minute.',
    geenAccount: 'No account with this email address.',
    geenNieuwe: 'New accounts are turned off on this project.',
    offline: 'No connection to the server. Are you online?',
  },
}

export function vertaalAuthFout(fout, taal = 'nl') {
  const melding = fout?.message ?? String(fout ?? '')
  const tabel = MELDINGEN[taal] ?? MELDINGEN.nl
  for (const [patroon, sleutel] of PATRONEN) {
    if (patroon.test(melding)) return melding.replace(patroon, tabel[sleutel])
  }
  return melding
}

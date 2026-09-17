/**
 * Supabase geeft zijn foutmeldingen in het Engels terug. Dit zijn de meldingen
 * die je bij het inloggen echt tegenkomt, in het Nederlands. Wat we niet kennen
 * geven we ongewijzigd door: liever een Engelse melding dan geen melding.
 */
const VERTALINGEN = [
  [/invalid login credentials/i, 'E-mailadres of wachtwoord klopt niet.'],
  [/email not confirmed/i, 'Dit e-mailadres is nog niet bevestigd. Check je mail.'],
  [/should be at least (\d+) characters/i, 'Kies een wachtwoord van minstens $1 tekens.'],
  [/different from the old password/i, 'Dit is je huidige wachtwoord al. Kies een ander.'],
  [/you can only request this after (\d+) seconds/i, 'Even wachten: probeer het over $1 seconden opnieuw.'],
  [/email rate limit exceeded/i, 'Te veel mails achter elkaar. Probeer het over een minuut opnieuw.'],
  [/user not found/i, 'Geen account met dit e-mailadres.'],
  [/signups not allowed/i, 'Nieuwe accounts zijn uitgezet op dit project.'],
  [/failed to fetch|network/i, 'Geen verbinding met de server. Ben je online?'],
]

export function vertaalAuthFout(fout) {
  const melding = fout?.message ?? String(fout ?? '')
  for (const [patroon, nederlands] of VERTALINGEN) {
    if (patroon.test(melding)) return melding.replace(patroon, nederlands)
  }
  return melding
}

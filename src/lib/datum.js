import { LOCALES } from './teksten'

// Formatters zijn niet gratis, dus we maken er per taal één en hergebruiken die.
const onthouden = new Map()

function formatters(taal) {
  if (!onthouden.has(taal)) {
    const locale = LOCALES[taal] ?? LOCALES.nl
    onthouden.set(taal, {
      relatief: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
      volledig: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }),
      kort: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
    })
  }
  return onthouden.get(taal)
}

const EENHEDEN = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

export function sindsdien(isoDatum, taal = 'nl') {
  const { relatief } = formatters(taal)
  const verschil = new Date(isoDatum).getTime() - Date.now()
  const absoluut = Math.abs(verschil)
  const zojuist = taal === 'en' ? 'just now' : 'zojuist'
  if (absoluut < 1000 * 60) return zojuist
  for (const [eenheid, ms] of EENHEDEN) {
    if (absoluut >= ms) return relatief.format(Math.round(verschil / ms), eenheid)
  }
  return zojuist
}

export const volledigeDatum = (isoDatum, taal = 'nl') =>
  formatters(taal).volledig.format(new Date(isoDatum))

export const korteDatum = (isoDatum, taal = 'nl') =>
  formatters(taal).kort.format(new Date(isoDatum))

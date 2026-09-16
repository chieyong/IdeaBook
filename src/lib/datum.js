const relatief = new Intl.RelativeTimeFormat('nl', { numeric: 'auto' })
const volledig = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'long', timeStyle: 'short' })
const kort = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' })

const EENHEDEN = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

export function sindsdien(isoDatum) {
  const verschil = new Date(isoDatum).getTime() - Date.now()
  const absoluut = Math.abs(verschil)
  if (absoluut < 1000 * 60) return 'zojuist'
  for (const [eenheid, ms] of EENHEDEN) {
    if (absoluut >= ms) return relatief.format(Math.round(verschil / ms), eenheid)
  }
  return 'zojuist'
}

export const volledigeDatum = (isoDatum) => volledig.format(new Date(isoDatum))
export const korteDatum = (isoDatum) => kort.format(new Date(isoDatum))

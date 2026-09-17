/**
 * De waarden zoals ze in de database staan. De labels komen uit teksten.js,
 * want die verschillen per taal; de waarden veranderen nooit.
 */
export const TYPES = [
  { waarde: 'app', code: 'APP' },
  { waarde: 'film', code: 'FLM' },
  { waarde: 'project', code: 'PRJ' },
  { waarde: 'overig', code: 'OVR' },
]

export const STATUSSEN = ['vonk', 'verkennen', 'uitwerken', 'geparkeerd', 'gedaan', 'kerkhof']

/** Korte modelcode, zoals op een typeplaatje. */
export const typeCode = (waarde) => TYPES.find((t) => t.waarde === waarde)?.code ?? 'OVR'

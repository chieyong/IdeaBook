export const TYPES = [
  { waarde: 'app', label: 'App', code: 'APP', emoji: '📱' },
  { waarde: 'film', label: 'Film', code: 'FLM', emoji: '🎬' },
  { waarde: 'project', label: 'Project', code: 'PRJ', emoji: '🔧' },
  { waarde: 'overig', label: 'Overig', code: 'OVR', emoji: '✳️' },
]

export const STATUSSEN = [
  { waarde: 'vonk', label: 'Vonk' },
  { waarde: 'verkennen', label: 'Verkennen' },
  { waarde: 'uitwerken', label: 'Uitwerken' },
  { waarde: 'geparkeerd', label: 'Geparkeerd' },
  { waarde: 'gedaan', label: 'Gedaan' },
  { waarde: 'kerkhof', label: 'Kerkhof' },
]

export const typeLabel = (waarde) => TYPES.find((t) => t.waarde === waarde)?.label ?? waarde
export const typeEmoji = (waarde) => TYPES.find((t) => t.waarde === waarde)?.emoji ?? '✳️'
/** Korte modelcode, zoals op een typeplaatje. */
export const typeCode = (waarde) => TYPES.find((t) => t.waarde === waarde)?.code ?? 'OVR'
export const statusLabel = (waarde) => STATUSSEN.find((s) => s.waarde === waarde)?.label ?? waarde

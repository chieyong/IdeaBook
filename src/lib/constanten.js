export const TYPES = [
  { waarde: 'app', label: 'App', emoji: '📱' },
  { waarde: 'film', label: 'Film', emoji: '🎬' },
  { waarde: 'project', label: 'Project', emoji: '🔧' },
  { waarde: 'overig', label: 'Overig', emoji: '✳️' },
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
export const statusLabel = (waarde) => STATUSSEN.find((s) => s.waarde === waarde)?.label ?? waarde

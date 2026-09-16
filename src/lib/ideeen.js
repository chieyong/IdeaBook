import { supabase } from './supabase'

const IDEE_VELDEN =
  'id, titel, type, status, enthousiasme, inspanning, tags, extern_url, created_at, updated_at, last_reviewed_at'

function controleer({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

// Eerste URL in een tekst; zo blijft een geplakte link ook als link bruikbaar.
const URL_PATROON = /https?:\/\/[^\s]+/i
export function haalLinkUit(tekst) {
  return tekst?.match(URL_PATROON)?.[0] ?? null
}

/**
 * Vangt een nieuw idee. Alleen de titel is verplicht; alles verder is optioneel
 * en wordt nooit afgedwongen. Een eventuele eerste zin wordt meteen het eerste
 * fragment op de tijdlijn.
 */
export async function vangIdee({ userId, titel, eersteZin, type = 'overig' }) {
  const idee = controleer(
    await supabase
      .from('idea')
      .insert({ user_id: userId, titel: titel.trim(), type, status: 'vonk' })
      .select(IDEE_VELDEN)
      .single(),
  )

  const inhoud = eersteZin?.trim()
  if (inhoud) {
    await voegFragmentToe({ userId, ideaId: idee.id, inhoud })
  }
  return idee
}

export async function haalIdeeen({ type = 'alle', status = 'alle' } = {}) {
  let query = supabase.from('idea').select(IDEE_VELDEN).order('updated_at', { ascending: false })
  if (type !== 'alle') query = query.eq('type', type)
  if (status !== 'alle') query = query.eq('status', status)
  else query = query.neq('status', 'kerkhof')
  return controleer(await query)
}

export async function haalInbox(limiet = 12) {
  return controleer(
    await supabase
      .from('idea')
      .select(IDEE_VELDEN)
      .eq('status', 'vonk')
      .order('created_at', { ascending: false })
      .limit(limiet),
  )
}

export async function haalIdee(id) {
  return controleer(await supabase.from('idea').select(IDEE_VELDEN).eq('id', id).single())
}

export async function zoekIdeeen(term, limiet = 8) {
  const schoon = term.trim()
  if (!schoon) return []
  const veilig = schoon.replace(/[%_,]/g, ' ')
  return controleer(
    await supabase
      .from('idea')
      .select('id, titel, type, status')
      .ilike('titel', `%${veilig}%`)
      .order('updated_at', { ascending: false })
      .limit(limiet),
  )
}

export async function haalFragmenten(ideaId) {
  return controleer(
    await supabase
      .from('fragment')
      .select('id, inhoud, afbeelding_url, link, created_at')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true }),
  )
}

export async function voegFragmentToe({ userId, ideaId, inhoud, link = null, afbeeldingUrl = null }) {
  const tekst = inhoud?.trim() || null
  return controleer(
    await supabase
      .from('fragment')
      .insert({
        idea_id: ideaId,
        user_id: userId,
        inhoud: tekst,
        link: link ?? haalLinkUit(tekst),
        afbeelding_url: afbeeldingUrl,
      })
      .select('id, inhoud, afbeelding_url, link, created_at')
      .single(),
  )
}

export async function verwijderFragment(id) {
  controleer(await supabase.from('fragment').delete().eq('id', id))
}

export async function werkIdeeBij(id, velden) {
  return controleer(await supabase.from('idea').update(velden).eq('id', id).select(IDEE_VELDEN).single())
}

export async function verwijderIdee(id) {
  controleer(await supabase.from('idea').delete().eq('id', id))
}

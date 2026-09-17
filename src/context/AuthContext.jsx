import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isGeconfigureerd } from '../lib/supabase'
import { vertaalAuthFout } from '../lib/authfouten'

const AuthContext = createContext(null)

/** Minimumlengte die we zelf afdwingen; Supabase staat standaard 6 toe. */
export const MINIMALE_WACHTWOORDLENGTE = 8

function stukLopen(fout) {
  if (fout) throw new Error(vertaalAuthFout(fout))
}

export function AuthProvider({ children }) {
  const [sessie, setSessie] = useState(null)
  const [bezig, setBezig] = useState(isGeconfigureerd)
  // Gezet als je via een herstelmail binnenkomt: dan eerst een nieuw wachtwoord.
  const [herstelModus, setHerstelModus] = useState(false)

  useEffect(() => {
    if (!isGeconfigureerd) return
    let actief = true

    supabase.auth.getSession().then(({ data }) => {
      if (!actief) return
      setSessie(data.session)
      setBezig(false)
    })

    const { data: abonnement } = supabase.auth.onAuthStateChange((gebeurtenis, nieuweSessie) => {
      setSessie(nieuweSessie)
      setBezig(false)
      if (gebeurtenis === 'PASSWORD_RECOVERY') setHerstelModus(true)
      if (gebeurtenis === 'SIGNED_OUT') setHerstelModus(false)
    })

    return () => {
      actief = false
      abonnement.subscription.unsubscribe()
    }
  }, [])

  const waarde = useMemo(
    () => ({
      sessie,
      gebruiker: sessie?.user ?? null,
      userId: sessie?.user?.id ?? null,
      bezig,
      isGeconfigureerd,
      herstelModus,

      /** De gewone weg: werkt binnen de app zelf, dus ook in de webapp. */
      async logInMetWachtwoord(email, wachtwoord) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })
        stukLopen(error)
      },

      /** Terugval, en de manier waarop je er de eerste keer in komt. */
      async stuurMagicLink(email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        })
        stukLopen(error)
      },

      /** Ook de weg om een eerste wachtwoord in te stellen. */
      async stuurHerstelmail(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        stukLopen(error)
      },

      async zetWachtwoord(wachtwoord) {
        const { error } = await supabase.auth.updateUser({ password: wachtwoord })
        stukLopen(error)
        setHerstelModus(false)
      },

      async logUit() {
        await supabase.auth.signOut()
      },
    }),
    [sessie, bezig, herstelModus],
  )

  return <AuthContext.Provider value={waarde}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth moet binnen een AuthProvider gebruikt worden')
  return context
}

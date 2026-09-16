import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isGeconfigureerd } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessie, setSessie] = useState(null)
  const [bezig, setBezig] = useState(isGeconfigureerd)

  useEffect(() => {
    if (!isGeconfigureerd) return
    let actief = true

    supabase.auth.getSession().then(({ data }) => {
      if (!actief) return
      setSessie(data.session)
      setBezig(false)
    })

    const { data: abonnement } = supabase.auth.onAuthStateChange((_gebeurtenis, nieuweSessie) => {
      setSessie(nieuweSessie)
      setBezig(false)
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
      async stuurMagicLink(email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw new Error(error.message)
      },
      async logUit() {
        await supabase.auth.signOut()
      },
    }),
    [sessie, bezig],
  )

  return <AuthContext.Provider value={waarde}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth moet binnen een AuthProvider gebruikt worden')
  return context
}

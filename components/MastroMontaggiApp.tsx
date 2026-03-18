'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import MastroMontaggi from '@/components/MastroMontaggi'

const DS = {
  teal: '#14B8A6', topbar: '#0B1F2A', border: '#E2E8F0',
  text: '#0B1F2A', textHint: '#94A3B8', bg: '#F8FAFC',
  font: '-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
}

interface Operatore { id: string; nome: string; cognome: string; azienda_id: string; pin: string | null }

export default function MastroMontaggiApp() {
  const sb = createClientComponentClient()
  const [operatore, setOperatore] = useState<Operatore | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mastro_montatore')
      if (saved) {
        const { op, exp } = JSON.parse(saved)
        if (Date.now() < exp) { setOperatore(op) }
        else localStorage.removeItem('mastro_montatore')
      }
    } catch {}
    setLoading(false)
  }, [])

  const verificaPin = async (pin: string) => {
    setPinError('')
    // Cerca operatore con questo PIN nell'azienda
    const { data, error } = await sb.from('operatori')
      .select('id,nome,cognome,azienda_id,pin')
      .eq('pin', pin)
      .eq('attivo', true)
      .single()

    if (error || !data) {
      setPinError('PIN non valido')
      setPinInput('')
      return
    }
    const op = data as Operatore
    setOperatore(op)
    localStorage.setItem('mastro_montatore', JSON.stringify({ op, exp: Date.now() + 8 * 3600 * 1000 }))
  }

  const logout = () => {
    localStorage.removeItem('mastro_montatore')
    setOperatore(null)
    setPinInput('')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: DS.font, color: DS.textHint }}>
      Caricamento...
    </div>
  )

  if (operatore) return (
    <MastroMontaggi
      operatoreId={operatore.id}
      operatoreNome={operatore.nome}
      aziendaId={operatore.azienda_id}
      onLogout={logout}
    />
  )

  // Schermata PIN
  return (
    <div style={{ minHeight: '100vh', background: DS.topbar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: DS.font }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>MASTRO MONTAGGI</div>
      <div style={{ fontSize: 13, color: '#ffffff60', marginBottom: 40 }}>Inserisci il tuo PIN operatore</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pinInput.length ? DS.teal : '#ffffff20' }} />
        ))}
      </div>

      {pinError && <div style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 16 }}>{pinError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 240 }}>
        {[1,2,3,4,5,6,7,8,9,'',0,'←'].map((n, i) => (
          <button key={i} onClick={async () => {
            if (n === '←') { setPinInput(p => p.slice(0,-1)); return }
            if (n === '') return
            const next = pinInput + String(n)
            setPinInput(next)
            if (next.length >= 6) await verificaPin(next)
          }} style={{ height: 64, borderRadius: 14, border: 'none', fontSize: 22, fontWeight: 600, background: n === '' ? 'transparent' : '#ffffff14', color: '#fff', cursor: n === '' ? 'default' : 'pointer', fontFamily: DS.font }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

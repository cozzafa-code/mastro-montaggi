// hooks/useMastroMontaggi.ts
// Supabase hook completo per MASTRO MONTAGGI
// Sostituisce i dati mock in MastroMontaggi.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface MontaggioRow {
  id: string
  commessa_id: string
  azienda_id: string
  stato: 'programmato' | 'in_corso' | 'completato' | 'annullato'
  ora_inizio: string | null
  ora_fine: string | null
  squadra: string[]
  note_misuratore: string | null
  avviato_at: string | null
  completato_at: string | null
  // JOIN commesse
  codice_commessa: string
  nome_cliente: string
  indirizzo: string
  citta: string
  telefono: string | null
  email: string | null
  saldo_residuo: number
}

export interface TaskMontaggio {
  id: string
  commessa_id: string | null
  montaggio_id: string | null
  operatore_id: string | null
  testo: string
  tipo: 'commessa' | 'libera' | 'ritorno'
  fatto: boolean
  ora_prevista: string | null
  fonte: string | null
  fatto_at: string | null
}

export interface EventoCalendario {
  id: string
  tipo: 'montaggio' | 'intervento' | 'task' | 'ritorno'
  titolo: string
  data: string
  ora_inizio: string | null
  ora_fine: string | null
  commessa_id: string | null
  montaggio_id: string | null
  completato: boolean
}

export interface Comunicazione {
  id: string
  commessa_id: string
  da_nome: string
  a_nome: string
  tipo: 'chiamata' | 'whatsapp' | 'email' | 'sms' | 'interno'
  testo: string | null
  durata_sec: number | null
  created_at: string
}

export interface FirmaCollaudo {
  id: string
  commessa_id: string
  firma_png_url: string | null
  cliente_nome: string
  cliente_email: string | null
  saldo_al_collaudo: number | null
  pdf_url: string | null
  inviato_cliente: boolean
  inviato_at: string | null
  created_at: string
}

// ─── HOOK PRINCIPALE ─────────────────────────────────────────────────────────
export function useMastroMontaggi(operatoreId: string) {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [montaggiOggi, setMontaggiOggi] = useState<MontaggioRow[]>([])
  const [taskOggi, setTaskOggi] = useState<TaskMontaggio[]>([])
  const subRef = useRef<any>(null)

  // ── Fetch montaggi di oggi per questo operatore ──
  const fetchMontaggiOggi = useCallback(async () => {
    const oggi = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('montaggi')
      .select(`
        id, commessa_id, azienda_id, stato, ora_inizio, ora_fine,
        squadra, note_misuratore, avviato_at, completato_at,
        commesse!inner (
          codice_commessa, nome_cliente, saldo_residuo,
          clienti ( indirizzo, citta, telefono, email )
        )
      `)
      .eq('data_montaggio', oggi)
      .contains('squadra', [operatoreId])
      .order('ora_inizio')

    if (error) { setError(error.message); return }

    const mapped: MontaggioRow[] = (data || []).map((m: any) => ({
      id: m.id,
      commessa_id: m.commessa_id,
      azienda_id: m.azienda_id,
      stato: m.stato,
      ora_inizio: m.ora_inizio,
      ora_fine: m.ora_fine,
      squadra: m.squadra || [],
      note_misuratore: m.note_misuratore,
      avviato_at: m.avviato_at,
      completato_at: m.completato_at,
      codice_commessa: m.commesse?.codice_commessa || '',
      nome_cliente: m.commesse?.nome_cliente || '',
      saldo_residuo: m.commesse?.saldo_residuo || 0,
      indirizzo: m.commesse?.clienti?.indirizzo || '',
      citta: m.commesse?.clienti?.citta || '',
      telefono: m.commesse?.clienti?.telefono || null,
      email: m.commesse?.clienti?.email || null,
    }))
    setMontaggiOggi(mapped)
  }, [supabase, operatoreId])

  // ── Fetch task di oggi per questo operatore ──
  const fetchTaskOggi = useCallback(async () => {
    const oggi = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('task_montaggi')
      .select('*')
      .eq('operatore_id', operatoreId)
      .or(`ora_prevista.is.null,ora_prevista.lte.${oggi}T23:59:59`)
      .order('tipo')
      .order('ora_prevista')

    if (error) { setError(error.message); return }
    setTaskOggi(data || [])
  }, [supabase, operatoreId])

  // ── Realtime subscription ──
  const setupRealtime = useCallback(() => {
    subRef.current = supabase
      .channel('montaggi_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'montaggi' }, fetchMontaggiOggi)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_montaggi' }, fetchTaskOggi)
      .subscribe()
  }, [supabase, fetchMontaggiOggi, fetchTaskOggi])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchMontaggiOggi(), fetchTaskOggi()])
      setupRealtime()
      setLoading(false)
    }
    init()
    return () => { subRef.current?.unsubscribe() }
  }, [fetchMontaggiOggi, fetchTaskOggi, setupRealtime])

  // ── AZIONI ────────────────────────────────────────────────────────────────

  const avviaMontaggio = useCallback(async (montaggioId: string) => {
    const { error } = await supabase
      .from('montaggi')
      .update({ stato: 'in_corso', avviato_at: new Date().toISOString() })
      .eq('id', montaggioId)
    if (error) throw new Error(error.message)
    // Crea automaticamente evento calendario
    await supabase.from('eventi_calendario').insert({
      montaggio_id: montaggioId,
      tipo: 'montaggio',
      titolo: 'Montaggio avviato',
      data: new Date().toISOString().split('T')[0],
      ora_inizio: new Date().toTimeString().split(' ')[0],
    })
  }, [supabase])

  const fermaMontaggio = useCallback(async (montaggioId: string) => {
    await supabase
      .from('montaggi')
      .update({ stato: 'programmato', avviato_at: null })
      .eq('id', montaggioId)
  }, [supabase])

  const completaMontaggio = useCallback(async (montaggioId: string) => {
    await supabase
      .from('montaggi')
      .update({ stato: 'completato', completato_at: new Date().toISOString() })
      .eq('id', montaggioId)
  }, [supabase])

  const toggleTask = useCallback(async (taskId: string, fatto: boolean) => {
    await supabase
      .from('task_montaggi')
      .update({ fatto, fatto_at: fatto ? new Date().toISOString() : null })
      .eq('id', taskId)
    setTaskOggi(prev => prev.map(t => t.id === taskId ? { ...t, fatto, fatto_at: fatto ? new Date().toISOString() : null } : t))
  }, [supabase])

  const addTask = useCallback(async (task: Partial<TaskMontaggio> & { azienda_id: string }) => {
    const { data, error } = await supabase
      .from('task_montaggi')
      .insert({ ...task, operatore_id: operatoreId })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setTaskOggi(prev => [...prev, data])
    return data
  }, [supabase, operatoreId])

  const registraComunicazione = useCallback(async (comm: {
    commessa_id: string; da_nome: string; a_nome: string
    tipo: Comunicazione['tipo']; testo: string; durata_sec?: number; azienda_id: string
  }) => {
    await supabase.from('comunicazioni_commessa').insert(comm)
  }, [supabase])

  const salvaFirma = useCallback(async (params: {
    commessa_id: string; montaggio_id: string; azienda_id: string
    firma_svg: string; cliente_nome: string; cliente_email: string; saldo_al_collaudo: number
  }) => {
    // 1. Salva firma in DB
    const { data: firma, error } = await supabase
      .from('firma_collaudo')
      .insert({
        ...params,
        inviato_cliente: false,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)

    // 2. Completa montaggio
    await completaMontaggio(params.montaggio_id)

    // 3. Trigger edge function per PDF + email (non bloccante)
    supabase.functions.invoke('invia-collaudo', {
      body: { firma_id: firma.id, commessa_id: params.commessa_id }
    }).catch(console.error)

    return firma
  }, [supabase, completaMontaggio])

  return {
    loading, error,
    montaggiOggi, taskOggi,
    fetchMontaggiOggi, fetchTaskOggi,
    avviaMontaggio, fermaMontaggio, completaMontaggio,
    toggleTask, addTask,
    registraComunicazione, salvaFirma,
  }
}

// ─── HOOK COMMESSA SINGOLA ────────────────────────────────────────────────────
export function useCommessaMontaggi(commessaId: string) {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [vani, setVani] = useState<any[]>([])
  const [task, setTask] = useState<TaskMontaggio[]>([])
  const [comunicazioni, setComunicazioni] = useState<Comunicazione[]>([])
  const [firmaEsistente, setFirmaEsistente] = useState<FirmaCollaudo | null>(null)

  useEffect(() => {
    if (!commessaId) return
    const fetch = async () => {
      setLoading(true)
      const [vaniRes, taskRes, commRes, firmaRes] = await Promise.all([
        supabase.from('vani').select('*').eq('commessa_id', commessaId).order('ordine'),
        supabase.from('task_montaggi').select('*').eq('commessa_id', commessaId).order('tipo'),
        supabase.from('comunicazioni_commessa').select('*').eq('commessa_id', commessaId).order('created_at', { ascending: false }),
        supabase.from('firma_collaudo').select('*').eq('commessa_id', commessaId).maybeSingle(),
      ])
      if (vaniRes.data) setVani(vaniRes.data)
      if (taskRes.data) setTask(taskRes.data)
      if (commRes.data) setComunicazioni(commRes.data)
      if (firmaRes.data) setFirmaEsistente(firmaRes.data)
      setLoading(false)
    }
    fetch()

    // Realtime per task e comunicazioni
    const sub = supabase
      .channel(`commessa_${commessaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_montaggi', filter: `commessa_id=eq.${commessaId}` },
        payload => {
          if (payload.eventType === 'UPDATE') setTask(prev => prev.map(t => t.id === payload.new.id ? payload.new as TaskMontaggio : t))
          if (payload.eventType === 'INSERT') setTask(prev => [...prev, payload.new as TaskMontaggio])
          if (payload.eventType === 'DELETE') setTask(prev => prev.filter(t => t.id !== payload.old.id))
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comunicazioni_commessa', filter: `commessa_id=eq.${commessaId}` },
        payload => setComunicazioni(prev => [payload.new as Comunicazione, ...prev]))
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [commessaId, supabase])

  return { loading, vani, task, comunicazioni, firmaEsistente, setTask }
}

// ─── HOOK CALENDARIO ──────────────────────────────────────────────────────────
export function useCalendarioMontaggi(operatoreId: string, anno: number, mese: number) {
  const supabase = createClientComponentClient()
  const [eventi, setEventi] = useState<EventoCalendario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = `${anno}-${String(mese).padStart(2, '0')}-01`
    const to = `${anno}-${String(mese).padStart(2, '0')}-31`

    supabase
      .from('eventi_calendario')
      .select('*')
      .eq('operatore_id', operatoreId)
      .gte('data', from)
      .lte('data', to)
      .order('data')
      .order('ora_inizio')
      .then(({ data }) => {
        setEventi(data || [])
        setLoading(false)
      })
  }, [supabase, operatoreId, anno, mese])

  return { eventi, loading }
}

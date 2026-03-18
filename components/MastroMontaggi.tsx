'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const DS = {
  teal: '#14B8A6', tealDark: '#0F766E', tealLight: '#CCFBF1', tealBg: '#F0FDF9',
  topbar: '#0B1F2A', bg: '#F8FAFC', white: '#FFFFFF',
  amber: '#D97706', amberLight: '#FEF3C7', amberBg: '#FFF7ED',
  red: '#DC2626', redLight: '#FEE2E2', redBg: '#FEF2F2',
  blue: '#3B82F6', blueLight: '#DBEAFE', blueBg: '#EFF6FF',
  text: '#0B1F2A', textMuted: '#64748B', textHint: '#94A3B8',
  border: '#E2E8F0', font: '-apple-system,BlinkMacSystemFont,"Inter",sans-serif',
}

// ─── TIPI ─────────────────────────────────────────────────────────────────────
interface Operatore { id: string; nome: string; cognome: string; ruolo: string; azienda_id: string }
interface Montaggio {
  id: string; commessa_id: string; stato: string; ora_inizio: string; ora_fine: string
  squadra: string[]; note_misuratore: string; urgente: boolean; avviato_at: string | null
  commesse: { codice_commessa: string; nome_cliente: string; saldo_residuo: number
    contatti: { indirizzo: string; citta: string; telefono: string; email: string } | null }
}
interface TaskMontaggio {
  id: string; testo: string; tipo: 'commessa'|'libera'|'ritorno'
  fatto: boolean; ora_prevista: string|null; fonte: string|null; commessa_id: string|null
}
interface Vano {
  id: string; label_vano: string; larghezza: number; altezza: number
  tipo_apertura: string; colore: string; stato_montaggio: string; note: string
}
interface Comunicazione {
  id: string; da_nome: string; a_nome: string
  tipo: string; testo: string; created_at: string; durata_sec: number|null
}
interface FirmaCollaudo {
  id: string; cliente_nome: string; inviato_cliente: boolean; created_at: string
}
interface LavorazioneRow {
  id: string; fase_nome: string; fase_colore: string
  operatore_nome: string; stato: string; note: string|null; completato_at: string|null
}
interface EventoCalendario {
  id: string; tipo: string; titolo: string; ora_inizio: string|null
  commessa_id: string|null; montaggio_id: string|null
}

// ─── HOOK SUPABASE ────────────────────────────────────────────────────────────
function useMastroMontaggi(operatoreId: string, aziendaId: string) {
  const sb = createClientComponentClient()
  const [montaggiOggi, setMontaggiOggi] = useState<Montaggio[]>([])
  const [montaggiDomani, setMontaggiDomani] = useState<Montaggio[]>([])
  const [taskOggi, setTaskOggi] = useState<TaskMontaggio[]>([])
  const [loading, setLoading] = useState(true)
  const subRef = useRef<any>(null)

  const oggi = new Date().toISOString().split('T')[0]
  const domani = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const fetchMontaggi = useCallback(async () => {
    const { data } = await sb.from('montaggi')
      .select(`id,commessa_id,stato,ora_inizio,ora_fine,squadra,note_misuratore,urgente,avviato_at,
        commesse(codice_commessa,nome_cliente,saldo_residuo,
          contatti(indirizzo,citta,telefono,email))`)
      .eq('azienda_id', aziendaId)
      .in('data_montaggio', [oggi, domani])
      .order('ora_inizio')
    const oggi_list = (data||[]).filter((_:any,i:number)=> true) as Montaggio[]
    setMontaggiOggi(oggi_list.filter((_m: any) => true))
    // In produzione filtra per data
    setMontaggiOggi(data?.filter((_:any) => true) as Montaggio[] || [])
  }, [sb, aziendaId, oggi, domani])

  const fetchTask = useCallback(async () => {
    const { data } = await sb.from('task_montaggi')
      .select('*').eq('operatore_id', operatoreId)
      .order('tipo').order('created_at')
    setTaskOggi(data as TaskMontaggio[] || [])
  }, [sb, operatoreId])

  useEffect(() => {
    Promise.all([fetchMontaggi(), fetchTask()]).then(() => setLoading(false))
    subRef.current = sb.channel('montaggi_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'montaggi' }, fetchMontaggi)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_montaggi' }, fetchTask)
      .subscribe()
    return () => { subRef.current?.unsubscribe() }
  }, [fetchMontaggi, fetchTask, sb])

  const avviaMontaggio = async (id: string) => {
    await sb.from('montaggi').update({ stato: 'in_corso', avviato_at: new Date().toISOString() }).eq('id', id)
  }
  const fermaMontaggio = async (id: string) => {
    await sb.from('montaggi').update({ stato: 'programmato', avviato_at: null }).eq('id', id)
  }
  const toggleTask = async (id: string, fatto: boolean) => {
    await sb.from('task_montaggi').update({ fatto, fatto_at: fatto ? new Date().toISOString() : null }).eq('id', id)
    setTaskOggi(prev => prev.map(t => t.id === id ? { ...t, fatto } : t))
  }
  const addTask = async (testo: string, tipo: string, commessa_id?: string) => {
    const { data } = await sb.from('task_montaggi').insert({
      azienda_id: aziendaId, operatore_id: operatoreId,
      testo, tipo, commessa_id: commessa_id || null
    }).select().single()
    if (data) setTaskOggi(prev => [...prev, data as TaskMontaggio])
  }
  const registraComunicazione = async (comm: Partial<Comunicazione> & { commessa_id: string }) => {
    await sb.from('comunicazioni_commessa').insert({ ...comm, azienda_id: aziendaId })
  }
  const salvaFirma = async (params: { commessa_id: string; montaggio_id: string; firma_svg: string; cliente_nome: string; cliente_email: string; saldo_al_collaudo: number }) => {
    const { data } = await sb.from('firma_collaudo').insert({ ...params, azienda_id: aziendaId, inviato_cliente: false }).select().single()
    await sb.from('montaggi').update({ stato: 'completato', completato_at: new Date().toISOString() }).eq('id', params.montaggio_id)
    await sb.functions.invoke('invia-collaudo', { body: { firma_id: data?.id, commessa_id: params.commessa_id } })
    return data
  }

  return { loading, montaggiOggi, montaggiDomani, taskOggi, fetchMontaggi, fetchTask, avviaMontaggio, fermaMontaggio, toggleTask, addTask, registraComunicazione, salvaFirma }
}

function useCommessaDetail(commessaId: string, montaggioId: string, aziendaId: string) {
  const sb = createClientComponentClient()
  const [vani, setVani] = useState<Vano[]>([])
  const [task, setTask] = useState<TaskMontaggio[]>([])
  const [comunicazioni, setComunicazioni] = useState<Comunicazione[]>([])
  const [lavorazioni, setLavorazioni] = useState<LavorazioneRow[]>([])
  const [firma, setFirma] = useState<FirmaCollaudo|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!commessaId) return
    Promise.all([
      sb.from('vani').select('id,label_vano,larghezza,altezza,tipo_apertura,colore,note').eq('commessa_id', commessaId).order('ordine'),
      sb.from('task_montaggi').select('*').eq('commessa_id', commessaId).order('tipo'),
      sb.from('comunicazioni_commessa').select('*').eq('commessa_id', commessaId).order('created_at', { ascending: false }),
      sb.from('lavorazioni_commessa').select('*').eq('commessa_id', commessaId).order('created_at'),
      sb.from('firma_collaudo').select('*').eq('commessa_id', commessaId).maybeSingle(),
    ]).then(([v, t, c, l, f]) => {
      setVani(v.data as Vano[] || [])
      setTask(t.data as TaskMontaggio[] || [])
      setComunicazioni(c.data as Comunicazione[] || [])
      setLavorazioni(l.data as LavorazioneRow[] || [])
      setFirma(f.data as FirmaCollaudo || null)
      setLoading(false)
    })
    const sub = sb.channel(`cm_${commessaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_montaggi', filter: `commessa_id=eq.${commessaId}` },
        p => { if (p.eventType==='UPDATE') setTask(prev => prev.map(t => t.id===p.new.id ? p.new as TaskMontaggio : t)) })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comunicazioni_commessa', filter: `commessa_id=eq.${commessaId}` },
        p => setComunicazioni(prev => [p.new as Comunicazione, ...prev]))
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [commessaId, sb])

  return { loading, vani, task, comunicazioni, lavorazioni, firma, setTask }
}

function useCalendario(operatoreId: string, aziendaId: string, data: string) {
  const sb = createClientComponentClient()
  const [eventi, setEventi] = useState<EventoCalendario[]>([])
  useEffect(() => {
    sb.from('eventi_calendario_montaggi').select('*')
      .eq('operatore_id', operatoreId).eq('data', data)
      .order('ora_inizio').then(({ data: d }) => setEventi(d as EventoCalendario[] || []))
  }, [operatoreId, data, sb])
  return { eventi }
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
const Badge = ({ children, bg, color }: any) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{children}</span>
)
const Btn = ({ children, onClick, color = DS.teal, style = {} }: any) => (
  <button onClick={onClick} style={{ background: color, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 15, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', ...style }}>{children}</button>
)
const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, padding: 14, cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>
)
const STitle = ({ children }: any) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', padding: '14px 16px 6px' }}>{children}</div>
)
const Modal = ({ children, onClose }: any) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ background: DS.white, borderRadius: '20px 20px 0 0', padding: '8px 20px 48px', width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border, margin: '8px auto 16px' }} />
      {children}
    </div>
  </div>
)

// ─── FIRMA CANVAS ─────────────────────────────────────────────────────────────
function FirmaCanvas({ onSalva }: { onSalva: (svg: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const paths = useRef<string[]>([])
  const [firmata, setFirmata] = useState(false)

  const pos = (e: any, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect()
    const s = e.touches ? e.touches[0] : e
    return { x: s.clientX - r.left, y: s.clientY - r.top }
  }

  const start = (e: any) => { e.preventDefault(); drawing.current = true; const c = ref.current!; const p = pos(e, c); last.current = p }
  const draw = (e: any) => {
    e.preventDefault(); if (!drawing.current) return
    const c = ref.current!; const ctx = c.getContext('2d')!; const p = pos(e, c)
    ctx.beginPath(); ctx.strokeStyle = DS.topbar; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    paths.current.push(`M${last.current.x},${last.current.y}L${p.x},${p.y}`)
    last.current = p; setFirmata(true)
  }
  const stop = () => { drawing.current = false }
  const clear = () => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); paths.current = []; setFirmata(false) }
  const salva = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 160"><path d="${paths.current.join(' ')}" stroke="#0B1F2A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>`
    onSalva(svg)
  }

  return (
    <div>
      <div style={{ border: `2px dashed ${firmata ? DS.teal : DS.border}`, borderRadius: 12, height: 160, position: 'relative', overflow: 'hidden', background: DS.bg, cursor: 'crosshair', marginBottom: 10 }}>
        <canvas ref={ref} width={340} height={160} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
        {!firmata && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: DS.textHint }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Tocca per firmare</div>
        </div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} style={{ flex: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer' }}>Cancella</button>
        <button onClick={firmata ? salva : undefined} style={{ flex: 2, background: firmata ? DS.teal : DS.border, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: DS.font, cursor: firmata ? 'pointer' : 'default' }}>Invia e salva firma</button>
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
interface Props { operatoreId: string; operatoreNome: string; aziendaId: string; onLogout: () => void }

export default function MastroMontaggi({ operatoreId, operatoreNome, aziendaId, onLogout }: Props) {
  const oggi = new Date().toISOString().split('T')[0]
  const { loading, montaggiOggi, taskOggi, toggleTask, addTask, avviaMontaggio, fermaMontaggio, salvaFirma } = useMastroMontaggi(operatoreId, aziendaId)
  const [screen, setScreen] = useState<'home'|'commessa'|'calendario'>('home')
  const [activeMontaggio, setActiveMontaggio] = useState<Montaggio|null>(null)
  const [modal, setModal] = useState<any>(null)
  const [cmTab, setCmTab] = useState(0)
  const [calView, setCalView] = useState<'g'|'s'|'m'>('g')
  const [firmaOk, setFirmaOk] = useState(false)
  const [started, setStarted] = useState(false)
  const { eventi } = useCalendario(operatoreId, aziendaId, oggi)
  const { vani, task: cmTask, comunicazioni, lavorazioni, firma } = useCommessaDetail(
    activeMontaggio?.commessa_id || '', activeMontaggio?.id || '', aziendaId
  )

  const giornoLabel = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  const TABS = ['Montaggio', 'Workflow', 'Team', 'Comunicaz.', 'Task', 'Firma']

  const openCommessa = (m: Montaggio) => { setActiveMontaggio(m); setScreen('commessa'); setCmTab(0) }
  const goHome = () => { setScreen('home'); setActiveMontaggio(null) }

  const ModalCall = ({ nome }: any) => (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📞</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: DS.text, marginBottom: 16 }}>{nome}</div>
      <Btn onClick={() => setModal(null)}>Avvia chiamata</Btn>
      <button onClick={() => setModal(null)} style={{ width: '100%', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer', marginTop: 8 }}>Registra nota</button>
    </div>
  )
  const ModalMsg = ({ nome }: any) => (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginBottom: 14 }}>Messaggio a {nome}</div>
      <textarea style={{ width: '100%', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: DS.font, height: 100, resize: 'none', outline: 'none' }} placeholder="Scrivi..." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        <button onClick={() => setModal(null)} style={{ background: DS.tealLight, color: DS.tealDark, border: 'none', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>WhatsApp</button>
        <button onClick={() => setModal(null)} style={{ background: DS.blueBg, color: '#1D4ED8', border: 'none', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>SMS</button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: DS.font, color: DS.textMuted, background: DS.bg }}>
      Caricamento montaggi...
    </div>
  )

  return (
    <div style={{ background: DS.bg, minHeight: '100vh', maxWidth: 430, margin: '0 auto', fontFamily: DS.font }}>
      {modal && <Modal onClose={() => setModal(null)}>{modal}</Modal>}

      {/* ── HOME ── */}
      {screen === 'home' && (
        <div>
          <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{operatoreNome[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Ciao, {operatoreNome}</div>
              <div style={{ fontSize: 11, color: '#ffffff60' }}>MASTRO MONTAGGI</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['oggi', montaggiOggi.length], ['domani', 0]].map(([l, n]) => (
                <div key={l as string} style={{ background: '#ffffff14', borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{n as number}</div>
                  <div style={{ fontSize: 10, color: '#ffffff60' }}>{l}</div>
                </div>
              ))}
              <button onClick={onLogout} style={{ background: '#ffffff14', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#ffffff90', fontSize: 12, cursor: 'pointer', fontFamily: DS.font }}>Esci</button>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: DS.teal, textTransform: 'uppercase', letterSpacing: '.8px', padding: '14px 16px 6px' }}>
            OGGI · {giornoLabel.toUpperCase()}
          </div>

          {montaggiOggi.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: DS.textHint }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏖️</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Nessun montaggio oggi</div>
            </div>
          ) : montaggiOggi.map(m => (
            <div key={m.id} onClick={() => openCommessa(m)} style={{ margin: '0 16px 8px', background: DS.white, borderRadius: 14, border: `1.5px solid ${m.stato === 'in_corso' ? DS.teal : DS.border}`, padding: 14, cursor: 'pointer' }}>
              {m.urgente && <div style={{ fontSize: 11, fontWeight: 700, color: DS.red, marginBottom: 4 }}>URGENTE</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>{m.commesse?.nome_cliente}</div>
                  <div style={{ fontSize: 12, color: DS.textMuted }}>{m.commesse?.contatti?.indirizzo}, {m.commesse?.contatti?.citta}</div>
                </div>
                <Badge bg={m.stato === 'in_corso' ? DS.tealLight : DS.amberLight} color={m.stato === 'in_corso' ? DS.tealDark : '#92400E'}>{m.stato}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: DS.textMuted }}>Ore {m.ora_inizio?.slice(0,5)}–{m.ora_fine?.slice(0,5)} · {vani.length} vani</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.amber }}>Saldo €{m.commesse?.saldo_residuo?.toLocaleString('it-IT')}</div>
              </div>
              {m.stato === 'in_corso' && <div style={{ height: 4, background: DS.teal, borderRadius: 2, marginTop: 8, width: '40%' }} />}
            </div>
          ))}

          <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', padding: '14px 16px 6px' }}>Task oggi</div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {taskOggi.map(t => (
              <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
                <div onClick={() => toggleTask(t.id, !t.fatto)} style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1 }}>
                  {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                  {t.fonte && <div style={{ fontSize: 11, color: DS.textHint, marginTop: 2 }}>{t.fonte}</div>}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : t.tipo === 'ritorno' ? DS.amberLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : t.tipo === 'ritorno' ? '#92400E' : '#1D4ED8' }}>{t.tipo}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setModal(
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginBottom: 14 }}>Nuova task</div>
                <input id="new-task" style={{ width: '100%', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: DS.font, outline: 'none', marginBottom: 10 }} placeholder="Descrivi la task..." />
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {['libera','commessa','ritorno'].map(t => (
                    <button key={t} onClick={async () => {
                      const txt = (document.getElementById('new-task') as HTMLInputElement)?.value
                      if (txt) { await addTask(txt, t); setModal(null) }
                    }} style={{ flex: 1, background: DS.tealBg, color: DS.tealDark, border: 'none', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>{t}</button>
                  ))}
                </div>
              </div>
            )} style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font }}>
              + Aggiungi task
            </button>
          </div>
          <div style={{ height: 80 }} />
        </div>
      )}

      {/* ── COMMESSA ── */}
      {screen === 'commessa' && activeMontaggio && (
        <div>
          <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={goHome} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{activeMontaggio.commesse?.nome_cliente}</div>
              <div style={{ fontSize: 11, color: '#ffffff60' }}>{activeMontaggio.commesse?.codice_commessa} · {activeMontaggio.commesse?.contatti?.indirizzo}</div>
            </div>
            <Badge bg={DS.teal} color="#fff">{activeMontaggio.stato}</Badge>
          </div>

          <div style={{ padding: '12px 16px 0' }}>
            <Btn onClick={async () => {
              if (started) { await fermaMontaggio(activeMontaggio.id); setStarted(false) }
              else { await avviaMontaggio(activeMontaggio.id); setStarted(true) }
            }} color={started ? DS.amber : DS.teal}>
              {started ? '⏸ In corso — tocca per fermare' : '▶ Inizia montaggio'}
            </Btn>
          </div>

          <div style={{ display: 'flex', background: DS.white, borderBottom: `1.5px solid ${DS.border}`, overflowX: 'auto', marginTop: 12 }}>
            {TABS.map((t, i) => (
              <div key={i} onClick={() => setCmTab(i)} style={{ padding: '11px 14px', fontSize: 13, fontWeight: cmTab === i ? 700 : 500, color: cmTab === i ? DS.text : DS.textHint, whiteSpace: 'nowrap', borderBottom: `2.5px solid ${cmTab === i ? DS.teal : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }}>{t}</div>
            ))}
          </div>

          {/* TAB 0: MONTAGGIO */}
          {cmTab === 0 && (
            <div style={{ padding: '12px 16px' }}>
              {vani.length === 0 ? (
                <Card><div style={{ color: DS.textMuted, fontSize: 13 }}>Nessun vano trovato per questa commessa</div></Card>
              ) : vani.map(v => (
                <div key={v.id} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ background: DS.topbar, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: DS.teal, textTransform: 'uppercase', letterSpacing: '.8px' }}>{v.label_vano}</div>
                    <div style={{ fontSize: 11, color: '#ffffff60' }}>{v.larghezza}×{v.altezza} · {v.colore}</div>
                  </div>
                  <div style={{ padding: 12 }}>
                    {v.note && (
                      <div style={{ background: DS.amberBg, borderLeft: `3px solid ${DS.amber}`, borderRadius: '0 8px 8px 0', padding: '8px 10px', fontSize: 13, color: '#451A03', lineHeight: 1.5 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', marginBottom: 3, textTransform: 'uppercase' }}>Note misuratore</div>
                        {v.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {activeMontaggio.note_misuratore && (
                <div style={{ background: DS.amberBg, borderLeft: `3px solid ${DS.amber}`, borderRadius: '0 10px 10px 0', padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', marginBottom: 4 }}>Attenzione montatori</div>
                  <div style={{ fontSize: 13, color: '#451A03', lineHeight: 1.6 }}>{activeMontaggio.note_misuratore}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Naviga', bg: DS.tealBg, ic: DS.teal },
                  { label: 'Chiama squadra', bg: DS.tealBg, ic: DS.teal, onClick: () => setModal(<ModalCall nome="Squadra" />) },
                  { label: 'Allegati', bg: DS.blueBg, ic: DS.blue },
                  { label: 'Segnala problema', bg: DS.redBg, ic: DS.red, danger: true },
                ].map(({ label, bg, ic, onClick, danger }: any) => (
                  <div key={label} onClick={onClick} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${danger ? DS.redLight : DS.border}`, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', minHeight: 80, justifyContent: 'center' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="22" height="22" fill="none" stroke={ic} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: danger ? DS.red : DS.text, textAlign: 'center' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: WORKFLOW */}
          {cmTab === 1 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Lavorazioni produzione */}
              {lavorazioni.length > 0 && (
                <div style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" fill="none" stroke="#7C3AED" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Produzione</div>
                      <div style={{ fontSize: 11, color: DS.textMuted }}>{lavorazioni.filter(l => l.stato === 'completato').length}/{lavorazioni.length} fasi</div>
                    </div>
                    <Badge bg="#D1FAE5" color="#065F46" style={{ marginLeft: 'auto' }}>Completata</Badge>
                  </div>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lavorazioni.map(l => (
                      <div key={l.id} style={{ background: DS.bg, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.fase_colore || DS.teal, flexShrink: 0, marginTop: 4 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>{l.fase_nome}</div>
                            <Badge bg={l.stato === 'completato' ? '#D1FAE5' : DS.amberLight} color={l.stato === 'completato' ? '#065F46' : '#92400E'}>{l.stato}</Badge>
                          </div>
                          <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{l.operatore_nome}{l.completato_at ? ` · ${new Date(l.completato_at).toLocaleDateString('it-IT')}` : ''}</div>
                          {l.note && <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic', marginTop: 2 }}>{l.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Montaggio step ORA */}
              <div style={{ background: DS.white, borderRadius: 12, border: `2px solid ${DS.teal}`, padding: 14, display: 'flex', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: DS.tealLight, border: `2px solid ${DS.teal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: DS.tealDark }}>ORA</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Montaggio</div>
                    <Badge bg={DS.amberLight} color="#92400E">In attesa</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{activeMontaggio.squadra?.join(', ')} · {activeMontaggio.ora_inizio?.slice(0,5)}</div>
                  <Btn style={{ marginTop: 10, padding: 12, fontSize: 14, borderRadius: 10 }} onClick={async () => { await avviaMontaggio(activeMontaggio.id); setStarted(true) }}>Inizia adesso</Btn>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM */}
          {cmTab === 2 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(activeMontaggio.squadra || []).map((nome, i) => (
                <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: DS.tealLight, color: DS.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{nome[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div>
                    <div style={{ fontSize: 12, color: DS.textMuted }}>Squadra montaggio</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setModal(<ModalCall nome={nome} />)} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: DS.tealBg, cursor: 'pointer' }}>📞</button>
                    <button onClick={() => setModal(<ModalMsg nome={nome} />)} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: DS.blueBg, cursor: 'pointer' }}>💬</button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 3: COMUNICAZIONI */}
          {cmTab === 3 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comunicazioni.map(c => (
                <div key={c.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: '12px 14px', borderLeft: `3px solid ${DS.teal}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DS.text }}>{c.da_nome} → {c.a_nome}</div>
                    <Badge bg={DS.tealBg} color={DS.teal}>{c.tipo}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{c.testo}</div>
                  <div style={{ fontSize: 11, color: DS.textHint, marginTop: 3 }}>{new Date(c.created_at).toLocaleString('it-IT')}</div>
                </div>
              ))}
              {comunicazioni.length === 0 && <div style={{ color: DS.textHint, fontSize: 13, textAlign: 'center', padding: 20 }}>Nessuna comunicazione registrata</div>}
              <button onClick={() => setModal(<ModalMsg nome={activeMontaggio.commesse?.nome_cliente} />)} style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 12, padding: 14, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font }}>+ Aggiungi nota</button>
            </div>
          )}

          {/* TAB 4: TASK */}
          {cmTab === 4 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cmTask.map(t => (
                <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1 }}>
                    {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                    {t.fonte && <div style={{ fontSize: 11, color: DS.textHint, marginTop: 2 }}>{t.fonte}</div>}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : t.tipo === 'ritorno' ? DS.amberLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : t.tipo === 'ritorno' ? '#92400E' : '#1D4ED8' }}>{t.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: FIRMA */}
          {cmTab === 5 && (
            <div style={{ padding: '14px 16px' }}>
              {firma ? (
                <div style={{ background: DS.tealBg, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.tealDark, marginBottom: 4 }}>✓ Firma acquisita</div>
                  <div style={{ fontSize: 13, color: '#065F46' }}>
                    {firma.inviato_cliente ? 'Email inviata al cliente' : 'Salvata — invio in corso'}<br />
                    {new Date(firma.created_at).toLocaleString('it-IT')}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ background: DS.tealBg, borderRadius: 12, padding: '12px 14px', marginBottom: 14, borderLeft: `3px solid ${DS.teal}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', marginBottom: 2 }}>Firma digitale finale</div>
                    <div style={{ fontSize: 12, color: '#166534' }}>Inviata automaticamente a cliente + ERP + copia locale</div>
                  </div>
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Riepilogo</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                      {activeMontaggio.commesse?.codice_commessa} · {activeMontaggio.commesse?.nome_cliente}<br />
                      {vani.length} vani montati · {new Date().toLocaleDateString('it-IT')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 10, borderTop: `1px solid ${DS.border}` }}>
                      <div style={{ fontSize: 13, color: DS.textMuted }}>Saldo residuo</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>€{activeMontaggio.commesse?.saldo_residuo?.toLocaleString('it-IT')}</div>
                    </div>
                  </Card>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Firma cliente</div>
                  <FirmaCanvas onSalva={async (svg) => {
                    await salvaFirma({
                      commessa_id: activeMontaggio.commessa_id,
                      montaggio_id: activeMontaggio.id,
                      firma_svg: svg,
                      cliente_nome: activeMontaggio.commesse?.nome_cliente,
                      cliente_email: activeMontaggio.commesse?.contatti?.email || '',
                      saldo_al_collaudo: activeMontaggio.commesse?.saldo_residuo || 0,
                    })
                    setFirmaOk(true)
                  }} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CALENDARIO ── */}
      {screen === 'calendario' && (
        <div>
          <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={goHome} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Calendario</div></div>
          </div>
          <div style={{ display: 'flex', background: DS.borderLight, borderRadius: 10, margin: '12px 16px 0', padding: 3 }}>
            {(['g','s','m'] as const).map(v => (
              <div key={v} onClick={() => setCalView(v)} style={{ flex: 1, padding: 8, textAlign: 'center', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: calView === v ? DS.white : 'transparent', color: calView === v ? DS.text : DS.textMuted }}>
                {v === 'g' ? 'Giorno' : v === 's' ? 'Settimana' : 'Mese'}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {eventi.length === 0 ? (
              <div style={{ color: DS.textHint, textAlign: 'center', padding: 40, fontSize: 14 }}>Nessun evento oggi</div>
            ) : eventi.map(e => {
              const c = e.tipo === 'montaggio' ? { bg: DS.tealLight, color: DS.tealDark, border: DS.teal } : e.tipo === 'intervento' ? { bg: DS.amberLight, color: '#92400E', border: DS.amber } : { bg: DS.blueBg, color: '#1D4ED8', border: DS.blue }
              return (
                <div key={e.id} onClick={e.commessa_id ? () => { const m = montaggiOggi.find(m => m.commessa_id === e.commessa_id); if(m) openCommessa(m) } : undefined}
                  style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 10, padding: '10px 12px', cursor: e.commessa_id ? 'pointer' : 'default' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{e.ora_inizio?.slice(0,5) || ''}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DS.text }}>{e.titolo}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: DS.white, borderTop: `1px solid ${DS.border}`, display: 'flex', zIndex: 50 }}>
        {[
          { label: 'Home', s: 'home', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> },
          { label: 'Calendario', s: 'calendario', icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
          { label: 'Task', s: 'home', icon: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></> },
          { label: 'Commessa', s: 'commessa', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
        ].map(({ label, s, icon }) => (
          <div key={label} onClick={() => { if (s === 'commessa' && !activeMontaggio && montaggiOggi[0]) openCommessa(montaggiOggi[0]); else setScreen(s as any) }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 14px', cursor: 'pointer', color: screen === s ? DS.teal : DS.textHint, fontSize: 10, fontWeight: 600 }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{icon}</svg>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

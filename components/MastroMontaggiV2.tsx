// v2-rebuild
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase as sb_client } from '@/lib/supabase'

const DS = {
  teal: '#28A0A0', tealDark: '#156060', tealLight: '#E8F4F4', tealBg: '#E8F4F4',
  topbar: '#0D1F1F', bg: '#E8F4F4', white: '#FFFFFF',
  card: '#FFFFFF', border: '#C8E4E4',
  amber: '#E8A020', amberLight: '#FEF3C7', amberBg: '#FFF7ED',
  red: '#DC4444', redLight: '#FEE2E2', redBg: '#FEF2F2',
  blue: '#3B7FE0', blueLight: '#DBEAFE', blueBg: '#EFF6FF',
  green: '#1A9E73', greenLight: '#D1FAE5', greenBg: '#ECFDF5',
  purple: '#8B5CF6', purpleLight: '#EDE9FE', purpleBg: '#F5F3FF',
  text: '#0D1F1F', textMuted: '#4A7070', textHint: '#8BBCBC',
  font: 'system-ui,-apple-system,sans-serif',
  shadow: '0 4px 0 0 #A8CCCC',
  shadowBtn: '0 5px 0 0 #156060',
}

interface Commessa {
  id: string; code: string; cliente: string; cognome: string
  saldo_residuo: number; totale_finale: number; contatto_id: string
}
interface Contatto {
  id: string; indirizzo: string; citta: string; telefono: string; email: string
}
interface Montaggio {
  id: string; commessa_id: string; stato: string
  ora_inizio: string; ora_fine: string; squadra: string[]
  note_misuratore: string; urgente: boolean; avviato_at: string | null
  azienda_id: string; data_montaggio: string
  commessa?: Commessa; contatto?: Contatto
}
interface TaskMontaggio {
  id: string; testo: string; tipo: 'commessa'|'libera'|'ritorno'
  fatto: boolean; ora_prevista: string|null; fonte: string|null
  commessa_id: string|null; operatore_id: string|null
}
interface Vano {
  id: string; nome: string; tipo: string; sistema: string
  colore_int: string; colore_est: string; note: string; misure_json: any
}
interface Comunicazione {
  id: string; da_nome: string; a_nome: string
  tipo: string; testo: string; created_at: string
}
interface LavorazioneRow {
  id: string; fase_nome: string; fase_colore: string
  operatore_nome: string; stato: string; note: string|null; completato_at: string|null
}

const FliwoxLogo = ({ size = 32 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" width={size} height={size}>
    <g>
      <rect x="95" y="15" width="8" height="8" rx="2" fill="#2FA7A2"/>
      <rect x="128" y="24" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="152" y="48" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="162" y="93" width="8" height="8" rx="2" fill="#2FA7A2"/>
      <rect x="152" y="138" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="128" y="162" width="8" height="8" rx="2" fill="#2FA7A2"/>
      <rect x="95" y="172" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="62" y="162" width="8" height="8" rx="2" fill="#2FA7A2"/>
      <rect x="38" y="138" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="28" y="93" width="8" height="8" rx="2" fill="#2FA7A2"/>
      <rect x="38" y="48" width="8" height="8" rx="2" fill="#28A0A0"/>
      <rect x="62" y="24" width="8" height="8" rx="2" fill="#2FA7A2"/>
    </g>
    <g transform="rotate(8 100 100)">
      <rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/>
      <path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
      <path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
    </g>
  </svg>
)

const Badge = ({ bg, color, children }: any) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' as any }}>{children}</span>
)

const Card = ({ children, style }: any) => (
  <div style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, boxShadow: DS.shadow, padding: '14px 16px', ...style }}>{children}</div>
)

const Btn = ({ children, onClick, style, secondary }: any) => (
  <button onClick={onClick} style={{
    background: secondary ? DS.white : DS.teal,
    color: secondary ? DS.teal : DS.white,
    border: secondary ? `1.5px solid ${DS.teal}` : 'none',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: 14, fontWeight: 800,
    cursor: 'pointer',
    width: '100%',
    boxShadow: secondary ? '0 4px 0 0 #A8CCCC' : DS.shadowBtn,
    fontFamily: DS.font,
    ...style
  }}>{children}</button>
)

const STATO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  programmato: { bg: DS.blueLight, color: '#1D4ED8', label: 'Programmato' },
  in_viaggio:  { bg: DS.purpleLight, color: '#6D28D9', label: 'In viaggio' },
  arrivato:    { bg: DS.amberLight, color: '#B45309', label: 'Arrivato' },
  in_corso:    { bg: DS.amberBg, color: '#D97706', label: 'In corso' },
  completato:  { bg: DS.greenLight, color: '#065F46', label: 'Completato' },
  collaudo:    { bg: DS.tealLight, color: DS.tealDark, label: 'Collaudo' },
  chiuso:      { bg: DS.greenLight, color: '#065F46', label: 'Chiuso' },
  annullato:   { bg: DS.redLight, color: '#991B1B', label: 'Annullato' },
}

const IcoWrench = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
const IcoHome = ({ color = 'currentColor', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IcoCalendar = ({ color = 'currentColor', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="4" x2="8" y2="10"/><line x1="16" y1="4" x2="16" y2="10"/>
  </svg>
)
const IcoFolder = ({ color = 'currentColor', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IcoMsg = ({ color = 'currentColor', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IcoCheck = ({ color = 'currentColor', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const IcoNav = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
)
const IcoPhone = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44 2 2 0 0 1 3.59 2.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17v-.08z"/>
  </svg>
)
const IcoAlert = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IcoClip = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)
const IcoPen = ({ color = 'currentColor', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)

function FirmaCanvas({ onSalva }: { onSalva: (svg: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const draw = (e: any) => {
    if (!drawing.current) return
    const c = canvasRef.current!; const ctx = c.getContext('2d')!
    const r = c.getBoundingClientRect()
    const x = (e.touches?.[0]?.clientX || e.clientX) - r.left
    const y = (e.touches?.[0]?.clientY || e.clientY) - r.top
    ctx.lineTo(x, y); ctx.stroke()
  }
  const start = (e: any) => {
    drawing.current = true
    const c = canvasRef.current!; const ctx = c.getContext('2d')!
    ctx.beginPath(); ctx.strokeStyle = DS.text; ctx.lineWidth = 2; ctx.lineCap = 'round'
    const r = c.getBoundingClientRect()
    ctx.moveTo((e.touches?.[0]?.clientX || e.clientX) - r.left, (e.touches?.[0]?.clientY || e.clientY) - r.top)
  }
  const stop = () => { drawing.current = false }
  const clear = () => { const c = canvasRef.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height) }
  const salva = () => {
    const c = canvasRef.current!
    onSalva(c.toDataURL())
  }
  return (
    <div>
      <canvas ref={canvasRef} width={340} height={160} onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        style={{ border: `2px solid ${DS.border}`, borderRadius: 12, width: '100%', height: 160, touchAction: 'none', background: '#FAFAFA' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Btn onClick={clear} secondary style={{ flex: 1 }}>Cancella</Btn>
        <Btn onClick={salva} style={{ flex: 2 }}>Salva firma</Btn>
      </div>
    </div>
  )
}

function useMastroMontaggi(operatoreId: string, aziendaId: string) {
  const sb = sb_client
  const [montaggiOggi, setMontaggiOggi] = useState<Montaggio[]>([])
  const [montaggiFuturi, setMontaggiFuturi] = useState<Montaggio[]>([])
  const [taskOggi, setTaskOggi] = useState<TaskMontaggio[]>([])
  const [loading, setLoading] = useState(true)
  const subRef = useRef<any>(null)
  const oggi = new Date().toISOString().split('T')[0]

  const fetchMontaggi = useCallback(async () => {
    const { data, error } = await sb.from('montaggi')
      .select('*, commessa:commesse(id,code,cliente,cognome,saldo_residuo,totale_finale,contatto_id)')
      .eq('azienda_id', aziendaId)
      .gte('data_montaggio', oggi)
      .order('data_montaggio').order('ora_inizio')
    if (!data) return
    const mapped: Montaggio[] = data.map((m: any) => ({
      ...m,
      commessa: m.commessa || null,
      contatto: null,
    }))
    setMontaggiOggi(mapped.filter(m => m.data_montaggio === oggi))
    setMontaggiFuturi(mapped.filter(m => m.data_montaggio > oggi))
  }, [sb, aziendaId, oggi])

  const fetchTask = useCallback(async () => {
    const { data } = await sb.from('task_montaggi').select('*').eq('operatore_id', operatoreId).order('created_at')
    setTaskOggi((data || []) as TaskMontaggio[])
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
    await fetchMontaggi()
  }
  const fermaMontaggio = async (id: string) => {
    await sb.from('montaggi').update({ stato: 'completato', completato_at: new Date().toISOString() }).eq('id', id)
    await fetchMontaggi()
  }
  const toggleTask = async (id: string, fatto: boolean) => {
    await sb.from('task_montaggi').update({ fatto, fatto_at: fatto ? new Date().toISOString() : null }).eq('id', id)
    setTaskOggi(prev => prev.map(t => t.id === id ? { ...t, fatto } : t))
  }
  const addTask = async (testo: string, tipo: string) => {
    const { data } = await sb.from('task_montaggi').insert({ azienda_id: aziendaId, operatore_id: operatoreId, testo, tipo }).select().single()
    if (data) setTaskOggi(prev => [...prev, data as TaskMontaggio])
  }
  const salvaFirma = async (params: { commessa_id: string; montaggio_id: string; firma_svg: string; cliente_nome: string; cliente_email: string; saldo_al_collaudo: number }) => {
    const { data } = await sb.from('firma_collaudo').insert({ ...params, azienda_id: aziendaId, inviato_cliente: false }).select().single()
    await sb.from('montaggi').update({ stato: 'completato', completato_at: new Date().toISOString() }).eq('id', params.montaggio_id)
    await fetchMontaggi()
    return data
  }
  return { montaggiOggi, montaggiFuturi, taskOggi, loading, avviaMontaggio, fermaMontaggio, toggleTask, addTask, salvaFirma, refetch: fetchMontaggi }
}

type Screen = 'home' | 'calendar' | 'commessa' | 'messaggi'

export default function MastroMontaggiV2({ operatoreId, operatoreNome, aziendaId, onLogout }: { operatoreId: string; operatoreNome: string; aziendaId: string; onLogout: () => void }) {
  const { montaggiOggi, montaggiFuturi, taskOggi, loading, avviaMontaggio, fermaMontaggio, toggleTask, addTask, salvaFirma } = useMastroMontaggi(operatoreId, aziendaId)
  const [screen, setScreen] = useState<Screen>('home')
  const [activeMontaggio, setActiveMontaggio] = useState<Montaggio | null>(null)
  const [cmTab, setCmTab] = useState(0)
  const [vani, setVani] = useState<Vano[]>([])
  const [lavorazioni, setLavorazioni] = useState<LavorazioneRow[]>([])
  const [comunicazioni, setComunicazioni] = useState<Comunicazione[]>([])
  const [cmTask, setCmTask] = useState<TaskMontaggio[]>([])
  const [firmaOk, setFirmaOk] = useState(false)
  const [started, setStarted] = useState(false)
  const [modal, setModal] = useState<any>(null)
  const [newTask, setNewTask] = useState('')
  const giorni = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab']
  const mesi = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
  const oggi = new Date()
  const oggiStr = oggi.toISOString().split('T')[0]

  const openCommessa = async (m: Montaggio) => {
    setActiveMontaggio(m); setScreen('commessa'); setCmTab(0); setFirmaOk(false); setStarted(m.stato === 'in_corso')
    const sb = sb_client
    if (m.commessa_id) {
      const [{ data: v }, { data: l }, { data: c }, { data: t }] = await Promise.all([
        sb.from('vani').select('*').eq('commessa_id', m.commessa_id),
        sb.from('lavorazioni_commessa').select('*').eq('commessa_id', m.commessa_id),
        sb.from('messaggi').select('*').eq('commessa_id', m.commessa_id).order('created_at').limit(20),
        sb.from('task_montaggi').select('*').eq('commessa_id', m.commessa_id),
      ])
      setVani((v || []) as Vano[])
      setLavorazioni((l || []) as LavorazioneRow[])
      setComunicazioni((c || []) as Comunicazione[])
      setCmTask((t || []) as TaskMontaggio[])
    }
  }

  const nomeCliente = activeMontaggio?.commessa ? `${activeMontaggio.commessa.cliente} ${activeMontaggio.commessa.cognome || ''}`.trim() : 'Cliente'
  const statoCfg = (s: string) => STATO_CONFIG[s] || STATO_CONFIG.programmato

  const dataNiceStr = (d: string) => {
    const dt = new Date(d + 'T00:00:00')
    if (d === oggiStr) return 'Oggi'
    const diff = Math.round((dt.getTime() - oggi.getTime()) / 86400000)
    if (diff === 1) return 'Domani'
    return `${giorni[dt.getDay()]} ${dt.getDate()} ${mesi[dt.getMonth()]}`
  }

  const CM_TABS = ['Info', 'Produzione', 'Squadra', 'Messaggi', 'Task', 'Firma']

  if (loading) return (
    <div style={{ minHeight: '100vh', background: DS.topbar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FliwoxLogo size={48} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, maxWidth: 430, margin: '0 auto', position: 'relative' }}>

      {/* TOPBAR */}
      <div style={{ background: DS.topbar, padding: '12px 16px 14px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FliwoxLogo size={28} />
            <div>
              <div style={{ fontSize: 11, color: '#8BBCBC', fontWeight: 600, letterSpacing: 1 }}>MASTRO MONTAGGI</div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>Ciao, {operatoreNome}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#28A0A0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 800, color: '#fff' }}>
              {montaggiOggi.length} oggi
            </div>
            <button onClick={onLogout} style={{ background: 'none', border: '1px solid #4A7070', borderRadius: 8, color: '#8BBCBC', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>Esci</button>
          </div>
        </div>
        {screen === 'commessa' && activeMontaggio && (
          <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '1px solid rgba(40,160,160,0.2)' }}>
            {CM_TABS.map((t, i) => (
              <div key={t} onClick={() => setCmTab(i)} style={{ flex: 1, textAlign: 'center', padding: '8px 2px', fontSize: 10, fontWeight: 700, color: cmTab === i ? DS.teal : '#4A7070', borderBottom: cmTab === i ? `2px solid ${DS.teal}` : '2px solid transparent', cursor: 'pointer', transition: 'all .15s' }}>{t}</div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: DS.white, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 430, margin: '0 auto' }}>
            {modal}
          </div>
        </div>
      )}

      {/* ===== HOME ===== */}
      {screen === 'home' && (
        <div style={{ padding: '16px 16px 100px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, letterSpacing: 1, marginBottom: 14 }}>
            {giorni[oggi.getDay()].toUpperCase()} {oggi.getDate()} {mesi[oggi.getMonth()].toUpperCase()} {oggi.getFullYear()}
          </div>

          {/* MONTAGGI OGGI */}
          <div style={{ fontSize: 13, fontWeight: 800, color: DS.text, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Montaggi di oggi</span>
            <span style={{ background: DS.teal, color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>{montaggiOggi.length}</span>
          </div>

          {montaggiOggi.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '28px 16px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="4" x2="8" y2="10"/><line x1="16" y1="4" x2="16" y2="10"/></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Nessun montaggio oggi</div>
              <div style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Controlla il calendario</div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {montaggiOggi.map(m => {
                const sc = statoCfg(m.stato)
                return (
                  <div key={m.id} onClick={() => openCommessa(m)} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${m.urgente ? DS.amber : DS.border}`, boxShadow: m.urgente ? '0 4px 0 0 #E8A020' : DS.shadow, padding: '14px 16px', cursor: 'pointer', borderLeft: `4px solid ${m.urgente ? DS.amber : DS.teal}` }}>
                    {m.urgente && <div style={{ fontSize: 10, fontWeight: 800, color: DS.amber, letterSpacing: 1, marginBottom: 4 }}>URGENTE</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: DS.text }}>{m.commessa ? `${m.commessa.cliente} ${m.commessa.cognome || ''}`.trim() : 'Commessa'}</div>
                      <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: DS.textMuted, marginBottom: 4 }}>{m.commessa?.code} · Ore {m.ora_inizio?.slice(0,5)}–{m.ora_fine?.slice(0,5)}</div>
                    {m.contatto?.indirizzo && <div style={{ fontSize: 12, color: DS.textHint }}>{m.contatto.indirizzo}{m.contatto.citta ? `, ${m.contatto.citta}` : ''}</div>}
                    {m.note_misuratore && <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 6, padding: '6px 10px', background: DS.tealBg, borderRadius: 8 }}>{m.note_misuratore}</div>}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      {m.stato === 'programmato' && (
                        <Btn onClick={async (e: any) => { e.stopPropagation(); await avviaMontaggio(m.id) }} style={{ flex: 1, padding: '10px', fontSize: 13 }}>
                          Avvia montaggio
                        </Btn>
                      )}
                      {m.stato === 'in_corso' && (
                        <Btn onClick={async (e: any) => { e.stopPropagation(); await fermaMontaggio(m.id) }} style={{ flex: 1, padding: '10px', fontSize: 13, background: DS.green, boxShadow: '0 5px 0 0 #0F6040' }}>
                          Completa
                        </Btn>
                      )}
                      <Btn onClick={(e: any) => { e.stopPropagation(); openCommessa(m) }} secondary style={{ flex: 1, padding: '10px', fontSize: 13 }}>
                        Dettagli
                      </Btn>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TASK */}
          <div style={{ fontSize: 13, fontWeight: 800, color: DS.text, marginTop: 20, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Task</span>
            <div onClick={() => setModal(
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 16 }}>Nuova task</div>
                <input id="nt" autoFocus placeholder="Descrizione task..." style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${DS.border}`, fontSize: 14, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' as any }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {['commessa','libera','ritorno'].map(tipo => (
                    <button key={tipo} onClick={async () => { const txt = (document.getElementById('nt') as HTMLInputElement)?.value; if (txt) { await addTask(txt, tipo); setModal(null) } }}
                      style={{ flex: 1, background: DS.tealBg, color: DS.tealDark, border: 'none', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>{tipo}</button>
                  ))}
                </div>
              </div>
            )} style={{ width: 28, height: 28, borderRadius: 8, background: DS.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, fontWeight: 300, border: 'none' }}>+</div>
          </div>

          {taskOggi.length === 0 ? (
            <Card style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: DS.textHint }}>Nessuna task — aggiungine una</div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {taskOggi.map(t => (
                <div key={t.id} onClick={() => toggleTask(t.id, !t.fatto)} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadow, padding: '12px 14px', display: 'flex', gap: 12, cursor: 'pointer', opacity: t.fatto ? 0.6 : 1 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {t.fatto && <IcoCheck color="#fff" size={13} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : '#1D4ED8' }}>{t.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROSSIMI */}
          {montaggiFuturi.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 800, color: DS.text, marginTop: 20, marginBottom: 10 }}>Prossimi montaggi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {montaggiFuturi.slice(0, 3).map(m => (
                  <Card key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '12px 14px' }} onClick={() => openCommessa(m)}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: DS.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcoWrench color={DS.teal} size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{m.commessa ? `${m.commessa.cliente} ${m.commessa.cognome || ''}`.trim() : 'Commessa'}</div>
                      <div style={{ fontSize: 12, color: DS.textMuted }}>{dataNiceStr(m.data_montaggio)} · {m.ora_inizio?.slice(0,5)}</div>
                    </div>
                    <Badge bg={statoCfg(m.stato).bg} color={statoCfg(m.stato).color}>{statoCfg(m.stato).label}</Badge>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== CALENDARIO ===== */}
      {screen === 'calendar' && (
        <div style={{ padding: '16px 16px 100px' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DS.text, marginBottom: 16 }}>Calendario</div>
          {montaggiOggi.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.teal, letterSpacing: 1, marginBottom: 8 }}>OGGI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {montaggiOggi.map(m => (
                  <Card key={m.id} onClick={() => openCommessa(m)} style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: m.urgente ? '#FEF3C7' : DS.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IcoWrench color={m.urgente ? DS.amber : DS.teal} size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{m.commessa ? `${m.commessa.cliente} ${m.commessa.cognome || ''}`.trim() : 'Commessa'}</div>
                      <div style={{ fontSize: 12, color: DS.textMuted }}>{m.ora_inizio?.slice(0,5)}–{m.ora_fine?.slice(0,5)}</div>
                    </div>
                    <Badge bg={statoCfg(m.stato).bg} color={statoCfg(m.stato).color}>{statoCfg(m.stato).label}</Badge>
                  </Card>
                ))}
              </div>
            </>
          )}
          {montaggiFuturi.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, letterSpacing: 1, marginBottom: 8 }}>PROSSIMI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {montaggiFuturi.map(m => (
                  <Card key={m.id} onClick={() => openCommessa(m)} style={{ cursor: 'pointer', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: DS.teal }}>{dataNiceStr(m.data_montaggio)}</div>
                      <Badge bg={statoCfg(m.stato).bg} color={statoCfg(m.stato).color}>{statoCfg(m.stato).label}</Badge>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: DS.text }}>{m.commessa ? `${m.commessa.cliente} ${m.commessa.cognome || ''}`.trim() : 'Commessa'}</div>
                    <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{m.ora_inizio?.slice(0,5)}–{m.ora_fine?.slice(0,5)} · {m.contatto?.citta || ''}</div>
                    {m.note_misuratore && <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 6, padding: '6px 10px', background: DS.tealBg, borderRadius: 8 }}>{m.note_misuratore}</div>}
                  </Card>
                ))}
              </div>
            </>
          )}
          {montaggiOggi.length === 0 && montaggiFuturi.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Nessun montaggio in programma</div>
            </Card>
          )}
        </div>
      )}

      {/* ===== COMMESSA DETAIL ===== */}
      {screen === 'commessa' && activeMontaggio && (
        <div style={{ paddingBottom: 100 }}>
          {/* Header commessa */}
          <div style={{ padding: '14px 16px', background: DS.white, borderBottom: `1px solid ${DS.border}` }}>
            <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.teal, fontSize: 13, fontWeight: 700, padding: 0, marginBottom: 8 }}>
              ← Torna a oggi
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: DS.text }}>{nomeCliente}</div>
                <div style={{ fontSize: 13, color: DS.textMuted }}>{activeMontaggio.commessa?.code} · {activeMontaggio.contatto?.indirizzo || 'Indirizzo non disponibile'}</div>
              </div>
              <Badge bg={statoCfg(activeMontaggio.stato).bg} color={statoCfg(activeMontaggio.stato).color}>{statoCfg(activeMontaggio.stato).label}</Badge>
            </div>
            {activeMontaggio.commessa?.totale_finale && (
              <div style={{ fontSize: 22, fontWeight: 900, color: DS.teal, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(activeMontaggio.commessa.totale_finale)}
              </div>
            )}
          </div>

          {/* INFO TAB */}
          {cmTab === 0 && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Card>
                <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 10 }}>Orari</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, background: DS.tealBg, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: DS.textMuted, fontWeight: 600 }}>INIZIO</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: DS.teal, fontFamily: 'monospace' }}>{activeMontaggio.ora_inizio?.slice(0,5)}</div>
                  </div>
                  <div style={{ flex: 1, background: DS.tealBg, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: DS.textMuted, fontWeight: 600 }}>FINE</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: DS.teal, fontFamily: 'monospace' }}>{activeMontaggio.ora_fine?.slice(0,5)}</div>
                  </div>
                </div>
              </Card>
              {activeMontaggio.contatto && (
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 10 }}>Contatto</div>
                  {activeMontaggio.contatto.indirizzo && <div style={{ fontSize: 13, color: DS.textMuted, marginBottom: 6 }}>{activeMontaggio.contatto.indirizzo}{activeMontaggio.contatto.citta ? `, ${activeMontaggio.contatto.citta}` : ''}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {activeMontaggio.contatto.telefono && (
                      <button onClick={() => window.location.href = `tel:${activeMontaggio.contatto?.telefono}`} style={{ background: DS.tealBg, border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: DS.font }}>
                        <IcoPhone color={DS.teal} size={16} /><span style={{ fontSize: 12, fontWeight: 700, color: DS.teal }}>Chiama</span>
                      </button>
                    )}
                    <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent((activeMontaggio.contatto?.indirizzo || '') + ' ' + (activeMontaggio.contatto?.citta || ''))}`)} style={{ background: DS.blueBg, border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: DS.font }}>
                      <IcoNav color={DS.blue} size={16} /><span style={{ fontSize: 12, fontWeight: 700, color: DS.blue }}>Naviga</span>
                    </button>
                    <button onClick={() => setModal(<div style={{ textAlign: 'center', padding: '10px 0' }}><div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Segnala problema</div><textarea placeholder="Descrivi il problema..." style={{ width: '100%', height: 80, padding: 10, borderRadius: 10, border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: DS.font, resize: 'none' as any }} /><Btn style={{ marginTop: 12 }} onClick={() => setModal(null)}>Invia segnalazione</Btn></div>)} style={{ background: DS.redBg, border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: DS.font }}>
                      <IcoAlert color={DS.red} size={16} /><span style={{ fontSize: 12, fontWeight: 700, color: DS.red }}>Problema</span>
                    </button>
                    <button onClick={() => setModal(<div><div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Allega documento</div><div style={{ border: `2px dashed ${DS.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: DS.textMuted, fontSize: 13 }}>Tocca per selezionare file</div><Btn style={{ marginTop: 12 }} onClick={() => setModal(null)}>Chiudi</Btn></div>)} style={{ background: DS.amberBg, border: 'none', borderRadius: 10, padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: DS.font }}>
                      <IcoClip color={DS.amber} size={16} /><span style={{ fontSize: 12, fontWeight: 700, color: DS.amber }}>Allegati</span>
                    </button>
                  </div>
                </Card>
              )}
              {vani.length > 0 && (
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 10 }}>Vani ({vani.length})</div>
                  {vani.map((v, i) => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < vani.length - 1 ? `1px solid ${DS.border}` : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: DS.tealBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcoWrench color={DS.teal} size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>{v.nome || `Vano ${i + 1}`}</div>
                        <div style={{ fontSize: 11, color: DS.textMuted }}>{v.tipo} {v.sistema ? `· ${v.sistema}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {activeMontaggio.stato === 'programmato' && <Btn onClick={async () => { await avviaMontaggio(activeMontaggio.id); setStarted(true) }} style={{ flex: 1 }}>Avvia montaggio</Btn>}
                {activeMontaggio.stato === 'in_corso' && <Btn onClick={async () => { await fermaMontaggio(activeMontaggio.id) }} style={{ flex: 1, background: DS.green, boxShadow: '0 5px 0 0 #0F6040' }}>Completa montaggio</Btn>}
              </div>
            </div>
          )}

          {/* PRODUZIONE TAB */}
          {cmTab === 1 && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lavorazioni.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 13, color: DS.textHint }}>Nessuna lavorazione registrata</div>
                </Card>
              ) : (
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 10 }}>Stato produzione</div>
                  {lavorazioni.map((l, i) => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < lavorazioni.length - 1 ? `1px solid ${DS.border}` : 'none' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.fase_colore || DS.teal, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: DS.text }}>{l.fase_nome}</div>
                        <div style={{ fontSize: 11, color: DS.textMuted }}>{l.operatore_nome}</div>
                      </div>
                      <Badge bg={l.stato === 'completato' ? DS.greenLight : DS.amberLight} color={l.stato === 'completato' ? '#065F46' : '#92400E'}>{l.stato}</Badge>
                    </div>
                  ))}
                </Card>
              )}
              <Card style={{ border: `2px solid ${DS.teal}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Montaggio</div>
                  <Badge bg={statoCfg(activeMontaggio.stato).bg} color={statoCfg(activeMontaggio.stato).color}>{statoCfg(activeMontaggio.stato).label}</Badge>
                </div>
                <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 10 }}>Ore {activeMontaggio.ora_inizio?.slice(0,5)}–{activeMontaggio.ora_fine?.slice(0,5)}</div>
                {activeMontaggio.stato === 'programmato' && <Btn onClick={async () => { await avviaMontaggio(activeMontaggio.id); setStarted(true) }}>Inizia adesso</Btn>}
              </Card>
            </div>
          )}

          {/* SQUADRA TAB */}
          {cmTab === 2 && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(activeMontaggio.squadra || []).length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 13, color: DS.textHint }}>Nessun membro squadra assegnato</div>
                </Card>
              ) : (
                (activeMontaggio.squadra || []).map((nome, i) => (
                  <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: DS.tealLight, color: DS.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{nome[0]}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div></div>
                    <button onClick={() => window.location.href = `tel:`} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: DS.tealBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IcoPhone color={DS.teal} size={18} />
                    </button>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* MESSAGGI TAB */}
          {cmTab === 3 && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comunicazioni.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 13, color: DS.textHint }}>Nessun messaggio per questa commessa</div>
                </Card>
              ) : (
                comunicazioni.map(c => (
                  <div key={c.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadow, padding: '12px 14px', borderLeft: `3px solid ${DS.teal}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 4 }}>{c.da_nome} → {c.a_nome}</div>
                    <div style={{ fontSize: 13, color: DS.textMuted }}>{c.testo}</div>
                    <div style={{ fontSize: 11, color: DS.textHint, marginTop: 4 }}>{new Date(c.created_at).toLocaleString('it-IT')}</div>
                  </div>
                ))
              )}
              <Card>
                <textarea placeholder="Scrivi un messaggio..." style={{ width: '100%', height: 72, padding: 10, borderRadius: 10, border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: DS.font, resize: 'none' as any, boxSizing: 'border-box' as any }} />
                <Btn style={{ marginTop: 8 }}>Invia messaggio</Btn>
              </Card>
            </div>
          )}

          {/* TASK TAB */}
          {cmTab === 4 && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cmTask.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 13, color: DS.textHint }}>Nessuna task per questa commessa</div>
                </Card>
              ) : (
                cmTask.map(t => (
                  <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, boxShadow: DS.shadow, padding: 14, display: 'flex', gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      {t.fatto && <IcoCheck color="#fff" size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: DS.tealLight, color: DS.tealDark }}>{t.tipo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FIRMA TAB */}
          {cmTab === 5 && (
            <div style={{ padding: '14px 16px' }}>
              {firmaOk ? (
                <Card style={{ textAlign: 'center', padding: 28, border: `2px solid ${DS.green}` }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: DS.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <IcoCheck color={DS.green} size={24} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: DS.green, marginBottom: 4 }}>Firma acquisita</div>
                  <div style={{ fontSize: 13, color: DS.textMuted }}>Salvata e inviata al cliente</div>
                </Card>
              ) : (
                <>
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Riepilogo collaudo</div>
                    <div style={{ fontSize: 14, color: DS.textMuted, lineHeight: 1.7 }}>
                      {nomeCliente}<br/>{vani.length} vani · {new Date().toLocaleDateString('it-IT')}
                    </div>
                    {activeMontaggio.commessa?.totale_finale && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 10, borderTop: `1px solid ${DS.border}` }}>
                        <div style={{ fontSize: 13, color: DS.textMuted }}>Totale</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: DS.text, fontFamily: 'JetBrains Mono, monospace' }}>
                          {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(activeMontaggio.commessa.totale_finale)}
                        </div>
                      </div>
                    )}
                  </Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Firma cliente</div>
                  <FirmaCanvas onSalva={async (svg) => {
                    await salvaFirma({
                      commessa_id: activeMontaggio.commessa_id,
                      montaggio_id: activeMontaggio.id,
                      firma_svg: svg,
                      cliente_nome: nomeCliente,
                      cliente_email: activeMontaggio.contatto?.email || '',
                      saldo_al_collaudo: activeMontaggio.commessa?.totale_finale || 0,
                    })
                    setFirmaOk(true)
                  }} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== MESSAGGI ===== */}
      {screen === 'messaggi' && (
        <div style={{ padding: '16px 16px 100px' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DS.text, marginBottom: 16 }}>Messaggi</div>
          <Card style={{ textAlign: 'center', padding: 28 }}>
            <IcoMsg color={DS.teal} size={36} />
            <div style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginTop: 12 }}>Chat in arrivo</div>
            <div style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>I messaggi delle commesse appaiono qui</div>
          </Card>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: DS.topbar, borderTop: '1px solid rgba(40,160,160,0.2)', display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {([
          { s: 'home' as Screen, label: 'Home', ico: <IcoHome /> },
          { s: 'calendar' as Screen, label: 'Agenda', ico: <IcoCalendar /> },
          { s: 'commessa' as Screen, label: 'Commessa', ico: <IcoFolder /> },
          { s: 'messaggi' as Screen, label: 'Talk', ico: <IcoMsg /> },
        ] as Array<{s: Screen, label: string, ico: any}>).map(({ s, label, ico }) => {
          const active = screen === s
          return (
            <div key={s} onClick={() => {
              if (s === 'commessa') {
                if (montaggiOggi[0]) openCommessa(montaggiOggi[0])
              } else {
                setScreen(s)
              }
            }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 12px', cursor: 'pointer' }}>
              <div style={{ color: active ? DS.teal : 'rgba(255,255,255,0.35)', transition: 'color .15s' }}>
                {ico}
              </div>
              <div style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? DS.teal : 'rgba(255,255,255,0.35)' }}>{label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

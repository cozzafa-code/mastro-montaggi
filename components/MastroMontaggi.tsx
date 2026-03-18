'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const DS = {
  teal: '#14B8A6', tealDark: '#0F766E', tealLight: '#CCFBF1', tealBg: '#F0FDF9',
  topbar: '#0B1F2A', bg: '#F8FAFC', white: '#FFFFFF',
  amber: '#D97706', amberLight: '#FEF3C7', amberBg: '#FFF7ED',
  red: '#DC2626', redLight: '#FEE2E2', redBg: '#FEF2F2',
  blue: '#3B82F6', blueLight: '#DBEAFE', blueBg: '#EFF6FF',
  text: '#0B1F2A', textMuted: '#64748B', textHint: '#94A3B8',
  border: '#E2E8F0', borderLight: '#F1F5F9',
  green: '#059669', greenLight: '#D1FAE5',
  font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Vano {
  id: string; label: string; larghezza: number; altezza: number
  tipo: string; anta: string; colore: string; stato: 'da_montare' | 'in_corso' | 'completato'
  note?: string
}
interface TaskItem {
  id: string; testo: string; tipo: 'commessa' | 'libera' | 'ritorno'
  fatto: boolean; ora?: string; fonte?: string
}
interface Comunicazione {
  id: string; da: string; a: string; tipo: 'chiamata' | 'whatsapp' | 'email' | 'interno'
  testo: string; data: string; durata?: string
}
interface Commessa {
  id: string; codice: string; cliente: string; indirizzo: string; citta: string
  data: string; oraInizio: string; oraFine: string
  squadra: string[]; vani: Vano[]; task: TaskItem[]
  comunicazioni: Comunicazione[]; stato: 'programmato' | 'in_corso' | 'completato'
  saldoResiduo: number; emailCliente: string
}
interface EventoCalendario {
  id: string; tipo: 'montaggio' | 'intervento' | 'task'
  titolo: string; ora: string; commessaId?: string
}

// ─── DATI MOCK (in produzione: Supabase realtime) ────────────────────────────
const COMMESSA_MOCK: Commessa = {
  id: 'cm-0039', codice: 'S-0039', cliente: 'Mario Esposito',
  indirizzo: 'Via Roma 14', citta: 'Rende (CS)',
  data: '19 Mar 2026', oraInizio: '09:00', oraFine: '13:00',
  squadra: ['Marco Vito', 'Giovanni Rea'],
  stato: 'programmato', saldoResiduo: 3840, emailCliente: 'mario.esposito@email.it',
  vani: [
    { id: 'v1', label: 'Vano 1 — Soggiorno', larghezza: 120, altezza: 150,
      tipo: 'finestra', anta: 'anta_sx', colore: 'RAL 9016', stato: 'in_corso',
      note: 'Battuta dx stretta 3cm — verificare prima fissaggio. Architrave legno: vite max 5cm.' },
    { id: 'v2', label: 'Vano 2 — Camera', larghezza: 90, altezza: 140,
      tipo: 'finestra', anta: 'fisso', colore: 'RAL 9016', stato: 'da_montare',
      note: 'Soglia da rabboccare PRIMA del montaggio.' },
  ],
  task: [
    { id: 't1', testo: 'Caricare furgone materiali', tipo: 'libera', fatto: true, ora: '08:00' },
    { id: 't2', testo: 'Rabbocco soglia Vano 2', tipo: 'commessa', fatto: false, fonte: 'Auto da ERP' },
    { id: 't3', testo: 'Verificare battuta dx 3cm Vano 1', tipo: 'commessa', fatto: false, fonte: 'Note misuratore' },
    { id: 't4', testo: 'Foto post-montaggio tutti i vani', tipo: 'commessa', fatto: false, fonte: 'Auto da ERP' },
    { id: 't5', testo: 'Ritorno Vano 2 — rifinitura', tipo: 'ritorno', fatto: false },
  ],
  comunicazioni: [
    { id: 'c1', da: 'Fabio Cozza', a: 'Mario Esposito', tipo: 'chiamata',
      testo: 'Conferma montaggio 19 marzo ore 9. Richiedere accesso scala condominiale.',
      data: '14 Mar · 11:20', durata: '4min' },
    { id: 'c2', da: 'Mario Esposito', a: 'Fabio Cozza', tipo: 'whatsapp',
      testo: 'Ok confermo le 9. Ho bisogno del badge per il condominio.', data: '14 Mar · 11:45' },
  ],
}

const CALENDARIO_MOCK: Record<string, EventoCalendario[]> = {
  '19': [
    { id: 'e1', tipo: 'task', titolo: 'Carica furgone ✓', ora: '08:00' },
    { id: 'e2', tipo: 'montaggio', titolo: 'Mario Esposito — S-0039 · Montaggio infissi', ora: '09:00', commessaId: 'cm-0039' },
    { id: 'e3', tipo: 'task', titolo: 'Firma collaudo Esposito', ora: '13:00' },
    { id: 'e4', tipo: 'intervento', titolo: 'Intervento · Rossi Luigi S-0031', ora: '15:00' },
    { id: 'e5', tipo: 'task', titolo: 'Scarico furgone magazzino', ora: '17:00' },
  ],
  '20': [{ id: 'e6', tipo: 'montaggio', titolo: 'Ferrari — S-0041', ora: '08:30' }],
  '21': [{ id: 'e7', tipo: 'intervento', titolo: 'Ritorno Esposito · Vano 2', ora: '10:00' }],
}

const TEAM_MOCK = [
  { nome: 'Fabio Cozza', ruolo: 'Responsabile preventivo', iniziale: 'F', tel: '+39 340 000 0001' },
  { nome: 'Paolo Greco', ruolo: 'Geometra misure', iniziale: 'P', tel: '+39 340 000 0002' },
  { nome: 'Lidia Cozza', ruolo: 'Resp. ordini', iniziale: 'L', tel: '+39 340 000 0003' },
  { nome: 'Antonio Bruno', ruolo: 'Magazziniere', iniziale: 'A', tel: '+39 340 000 0004' },
]

// ─── COMPONENTI UI BASE ───────────────────────────────────────────────────────
const Btn = ({ children, onClick, color = DS.teal, style = {} }: any) => (
  <button onClick={onClick} style={{
    background: color, color: '#fff', border: 'none', borderRadius: 12,
    padding: '14px 16px', fontSize: 15, fontWeight: 700, fontFamily: DS.font,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, width: '100%', ...style,
  }}>{children}</button>
)

const Badge = ({ children, bg, color }: any) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
    {children}
  </span>
)

const SectionTitle = ({ children }: any) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', padding: '14px 16px 6px' }}>
    {children}
  </div>
)

const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{
    background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`,
    padding: 14, cursor: onClick ? 'pointer' : 'default', ...style,
  }}>{children}</div>
)

// ─── DISEGNO TECNICO SVG ──────────────────────────────────────────────────────
function DisegnoVano({ vano, tipo }: { vano: Vano; tipo: 'attuale' | 'futuro' }) {
  const hasAnta = vano.anta === 'anta_sx' || vano.anta === 'anta_dx'
  return (
    <div style={{
      borderRadius: 10, border: `${tipo === 'futuro' ? '1.5px solid ' + DS.teal : '1px solid ' + DS.border}`,
      padding: 8, background: tipo === 'futuro' ? DS.tealBg : DS.bg,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: tipo === 'futuro' ? DS.teal : DS.textHint, textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
        {tipo === 'attuale' ? 'Stato attuale' : 'Come montare'}
      </div>
      <svg viewBox="0 0 120 105" style={{ width: '100%', height: 100 }}>
        {/* Muratura */}
        <rect x="0" y="0" width="120" height="105" fill="#D1D5DB" rx="2" />
        {/* Vano */}
        <rect x="14" y="10" width="92" height="87" fill="#F8FAFC" />
        {tipo === 'attuale' ? (
          <>
            {/* Controtelaio */}
            <rect x="14" y="10" width="8" height="87" fill="#9CA3AF" />
            <rect x="98" y="10" width="8" height="87" fill="#9CA3AF" />
            <rect x="14" y="10" width="92" height="7" fill="#9CA3AF" />
            {/* Soglia mancante evidenziata */}
            <rect x="14" y="92" width="92" height="5" fill="#FCA5A5" rx="1" />
            <text x="60" y="58" textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="Inter,sans-serif">Controtelaio OK</text>
            <text x="60" y="101" textAnchor="middle" fontSize="7" fill="#DC2626" fontFamily="Inter,sans-serif">soglia mancante</text>
          </>
        ) : (
          <>
            {/* Controtelaio completo */}
            <rect x="14" y="10" width="8" height="87" fill="#6B7280" />
            <rect x="98" y="10" width="8" height="87" fill="#6B7280" />
            <rect x="14" y="10" width="92" height="7" fill="#6B7280" />
            <rect x="14" y="89" width="92" height="8" fill="#6B7280" />
            {/* Telaio */}
            <rect x="23" y="18" width="74" height="68" fill="none" stroke={DS.topbar} strokeWidth="2.5" rx="1" />
            {hasAnta ? (
              <>
                {/* Anta sx */}
                <rect x="25" y="20" width="34" height="64" fill={DS.blueLight} stroke={DS.blue} strokeWidth="1.5" rx="1" />
                <line x1="25" y1="20" x2="59" y2="84" stroke={DS.blue} strokeWidth="1" strokeDasharray="3,2" />
                <path d="M25,52 A28,32 0 0,0 52,20" fill="none" stroke={DS.blue} strokeWidth="1" strokeDasharray="3,2" />
                {/* Fisso dx */}
                <rect x="61" y="20" width="34" height="64" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1.5" rx="1" />
                <line x1="61" y1="52" x2="95" y2="52" stroke="#0891B2" strokeWidth="1" strokeDasharray="3,2" />
                {/* Maniglia */}
                <rect x="57" y="48" width="4" height="10" fill={DS.topbar} rx="2" />
                <text x="42" y="55" textAnchor="middle" fontSize="7" fill="#1D4ED8" fontFamily="Inter,sans-serif">anta sx</text>
                <text x="78" y="55" textAnchor="middle" fontSize="7" fill={DS.topbar} fontFamily="Inter,sans-serif">fisso</text>
              </>
            ) : (
              <>
                <rect x="25" y="20" width="70" height="64" fill="#E0F2FE" stroke="#0891B2" strokeWidth="1.5" rx="1" />
                <text x="60" y="55" textAnchor="middle" fontSize="8" fill={DS.topbar} fontFamily="Inter,sans-serif">fisso</text>
              </>
            )}
            {/* Soglia completata */}
            <rect x="14" y="89" width="92" height="8" fill={DS.teal} opacity={.5} />
            <text x="60" y="101" textAnchor="middle" fontSize="7" fill={DS.tealDark} fontFamily="Inter,sans-serif">soglia + rabbocco</text>
          </>
        )}
      </svg>
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: any) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: '#00000055', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: DS.white, borderRadius: '20px 20px 0 0', padding: '8px 20px 48px',
        width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border, margin: '8px auto 16px' }} />
        {children}
      </div>
    </div>
  )
}

// ─── FIRMA CANVAS ─────────────────────────────────────────────────────────────
function FirmaCanvas({ onFirmaCompleta }: { onFirmaCompleta: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const [firmata, setFirmata] = useState(false)

  const getPos = (e: any, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - r.left, y: src.clientY - r.top }
  }

  const start = useCallback((e: any) => {
    e.preventDefault()
    drawing.current = true
    const canvas = canvasRef.current!
    const pos = getPos(e, canvas)
    last.current = pos
  }, [])

  const draw = useCallback((e: any) => {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.strokeStyle = DS.topbar
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    last.current = pos
    setFirmata(true)
  }, [])

  const stop = useCallback(() => { drawing.current = false }, [])

  const clear = () => {
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setFirmata(false)
  }

  return (
    <div>
      <div style={{
        border: `2px dashed ${firmata ? DS.teal : DS.border}`, borderRadius: 12,
        height: 160, position: 'relative', overflow: 'hidden', marginBottom: 10,
        background: DS.bg, cursor: 'crosshair',
      }}>
        <canvas ref={canvasRef} width={340} height={160}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
        {!firmata && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: DS.textHint }}>Tocca per firmare</div>
            <div style={{ fontSize: 12, color: DS.textHint, marginTop: 2 }}>Mario Esposito</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} style={{
          flex: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10,
          padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer',
        }}>Cancella</button>
        <button onClick={firmata ? onFirmaCompleta : undefined} style={{
          flex: 2, background: firmata ? DS.teal : DS.border, color: '#fff', border: 'none',
          borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: DS.font,
          cursor: firmata ? 'pointer' : 'default', transition: 'background .2s',
        }}>Invia e salva firma</button>
      </div>
    </div>
  )
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ onOpenCommessa, onOpenCalendario }: any) {
  const [tasks, setTasks] = useState(COMMESSA_MOCK.task)
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, fatto: !t.fatto } : t))

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>M</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Buongiorno, Marco</div>
          <div style={{ fontSize: 11, color: '#ffffff60', marginTop: 1 }}>Mercoledì 19 Marzo 2026</div>
        </div>
        <div onClick={onOpenCalendario} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        </div>
      </div>

      <SectionTitle>Oggi — 19 Mar</SectionTitle>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Commessa principale */}
        <div onClick={onOpenCommessa} style={{ background: DS.white, borderRadius: 14, border: `1.5px solid ${DS.teal}`, padding: 14, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Mario Esposito</div>
              <div style={{ fontSize: 12, color: DS.textMuted }}>S-0039 · Via Roma 14, Rende</div>
            </div>
            <Badge bg={DS.tealLight} color={DS.tealDark}>09:00–13:00</Badge>
          </div>
          <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 8 }}>Marco Vito · Giovanni Rea · 2 vani · Serramenti</div>
          <div style={{ background: DS.tealBg, borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#065F46', fontWeight: 600 }}>
            Tutti i dati arrivano automaticamente da ERP — nessuna inserzione manuale
          </div>
        </div>
        {/* Intervento */}
        <Card style={{ border: `1px solid ${DS.amberLight}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Intervento · Rossi Luigi</div>
              <div style={{ fontSize: 12, color: DS.textMuted }}>S-0031 · Cosenza · Anta difettosa</div>
            </div>
            <Badge bg={DS.amberLight} color="#92400E">15:00</Badge>
          </div>
        </Card>
      </div>

      <SectionTitle>Task da completare oggi</SectionTitle>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
            <div onClick={() => toggleTask(t.id)} style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
              border: t.fatto ? 'none' : `2px solid ${DS.border}`,
              background: t.fatto ? DS.teal : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1,
            }}>
              {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
              <div style={{ fontSize: 11, color: DS.textHint, marginTop: 3 }}>{t.ora || ''} {t.fonte ? `· ${t.fonte}` : ''}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4,
                background: t.tipo === 'commessa' ? DS.tealLight : t.tipo === 'ritorno' ? DS.amberLight : DS.blueBg,
                color: t.tipo === 'commessa' ? DS.tealDark : t.tipo === 'ritorno' ? '#92400E' : '#1D4ED8',
              }}>{t.tipo === 'commessa' ? 'Commessa' : t.tipo === 'ritorno' ? 'Ritorno' : 'Libera'}</span>
            </div>
          </div>
        ))}
        <button style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font }}>
          + Aggiungi task
        </button>
      </div>
      <div style={{ height: 12 }} />
    </div>
  )
}

// ─── CALENDARIO SCREEN ────────────────────────────────────────────────────────
function CalendarioScreen({ onBack, onOpenCommessa }: any) {
  const [view, setView] = useState<'g' | 's' | 'm'>('g')
  const HOURS = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17']
  const eventi = CALENDARIO_MOCK['19'] || []
  const evColor = (tipo: string) => tipo === 'montaggio' ? { bg: DS.tealLight, color: DS.tealDark, border: DS.teal } : tipo === 'intervento' ? { bg: DS.amberLight, color: '#92400E', border: DS.amber } : { bg: DS.blueBg, color: '#1D4ED8', border: DS.blue }

  return (
    <div>
      <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Calendario</div>
          <div style={{ fontSize: 11, color: '#ffffff60', marginTop: 1 }}>Marco Vito · Marzo 2026</div>
        </div>
        <button style={{ background: DS.teal, color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font }}>+ Task</button>
      </div>

      {/* Toggle giorno/settimana/mese */}
      <div style={{ display: 'flex', background: DS.borderLight, borderRadius: 10, margin: '12px 16px 0', padding: 3 }}>
        {(['g', 's', 'm'] as const).map(v => (
          <div key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: 8, textAlign: 'center', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: view === v ? DS.white : 'transparent',
            color: view === v ? DS.text : DS.textMuted,
            boxShadow: view === v ? '0 1px 3px #0001' : 'none',
          }}>{v === 'g' ? 'Giorno' : v === 's' ? 'Settimana' : 'Mese'}</div>
        ))}
      </div>

      {/* Vista Giorno */}
      {view === 'g' && (
        <div>
          <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>Mercoledì 19 Marzo</div>
          </div>
          <div style={{ padding: '0 16px' }}>
            {HOURS.map(h => {
              const ev = eventi.filter(e => e.ora.startsWith(h + ':'))
              return (
                <div key={h} style={{ display: 'flex', alignItems: 'flex-start', minHeight: 52, borderBottom: `1px solid ${DS.borderLight}` }}>
                  <div style={{ width: 44, fontSize: 11, color: DS.textHint, paddingTop: 8, flexShrink: 0, fontWeight: 500 }}>{h}:00</div>
                  <div style={{ flex: 1, padding: '4px 0 4px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {ev.map(e => {
                      const c = evColor(e.tipo)
                      return (
                        <div key={e.id} onClick={e.commessaId ? onOpenCommessa : undefined}
                          style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, color: c.color, cursor: e.commessaId ? 'pointer' : 'default' }}>
                          {e.titolo}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vista Settimana */}
      {view === 's' && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 12 }}>
            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: DS.textHint, marginBottom: 4, textTransform: 'uppercase' }}>{d}</div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, margin: '0 auto', background: i === 2 ? DS.teal : 'transparent', color: i === 2 ? '#fff' : DS.text }}>
                  {[17, 18, 19, 20, 21, 22, 23][i]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { giorno: 'Lunedì 17', eventi: [{ tipo: 'montaggio', testo: 'Bianchi — S-0037 · Zanzariere 09:00–11:00' }] },
              { giorno: 'Mercoledì 19 (oggi)', eventi: [{ tipo: 'montaggio', testo: 'Esposito — S-0039 · Infissi 09:00–13:00', click: true }, { tipo: 'intervento', testo: 'Intervento · Rossi S-0031 · 15:00' }] },
              { giorno: 'Giovedì 20', eventi: [{ tipo: 'montaggio', testo: 'Ferrari — S-0041 · Serramenti 08:30–12:00' }] },
              { giorno: 'Venerdì 21', eventi: [{ tipo: 'intervento', testo: 'Ritorno Esposito · Vano 2 · 10:00' }] },
            ].map(({ giorno, eventi: evs }) => (
              <div key={giorno}>
                <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6 }}>{giorno}</div>
                {evs.map((e: any, i) => {
                  const c = evColor(e.tipo)
                  return <div key={i} onClick={e.click ? onOpenCommessa : undefined} style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: c.color, marginBottom: 4, cursor: e.click ? 'pointer' : 'default' }}>{e.testo}</div>
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista Mese */}
      {view === 'm' && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: DS.textHint, padding: 4 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2
              const num = day <= 0 ? day + 28 : day
              const isOther = day <= 0 || day > 31
              const isToday = day === 19
              const dots = day === 4 ? ['m'] : day === 7 ? ['m'] : day === 10 ? ['m', 'i'] : day === 17 ? ['m'] : day === 19 ? ['m', 'i'] : day === 20 ? ['m'] : day === 21 ? ['i'] : day === 24 ? ['m'] : []
              return (
                <div key={i} style={{ textAlign: 'center', padding: '4px 2px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday ? 700 : 500, margin: '0 auto', background: isToday ? DS.teal : 'transparent', color: isToday ? '#fff' : isOther ? DS.border : DS.text }}>{num}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, height: 5 }}>
                    {dots.map((d, di) => <div key={di} style={{ width: 4, height: 4, borderRadius: '50%', background: isToday ? '#fff' : d === 'm' ? DS.teal : DS.amber }} />)}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[{ c: DS.teal, l: 'Montaggio' }, { c: DS.amber, l: 'Intervento' }, { c: DS.blue, l: 'Task' }].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: DS.textMuted }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── COMMESSA SCREEN ──────────────────────────────────────────────────────────
function CommessaScreen({ commessa, onBack }: { commessa: Commessa; onBack: () => void }) {
  const [tab, setTab] = useState(0)
  const [started, setStarted] = useState(false)
  const [tasks, setTasks] = useState(commessa.task)
  const [modal, setModal] = useState<any>(null)
  const [firmaOk, setFirmaOk] = useState(false)

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, fatto: !t.fatto } : t))
  const TABS = ['Montaggio', 'Workflow', 'Team', 'Comunicaz.', 'Task', 'Firma']

  const ModalCall = ({ nome }: any) => (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📞</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: DS.text }}>{nome}</div>
      <div style={{ fontSize: 13, color: DS.textMuted, marginBottom: 20 }}>+39 340 000 0000</div>
      <Btn onClick={() => setModal(null)} style={{ marginBottom: 8 }}>Avvia chiamata</Btn>
      <button onClick={() => setModal(null)} style={{ width: '100%', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer' }}>Registra nota</button>
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
      <button onClick={() => setModal(null)} style={{ width: '100%', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 13, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer', marginTop: 8 }}>MASTRO interno</button>
    </div>
  )

  return (
    <div>
      {modal && <Modal onClose={() => setModal(null)}>{modal}</Modal>}

      {/* Topbar */}
      <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{commessa.cliente}</div>
          <div style={{ fontSize: 11, color: '#ffffff60', marginTop: 1 }}>{commessa.codice} · {commessa.indirizzo}, {commessa.citta}</div>
        </div>
        <Badge bg={DS.teal} color="#fff">{commessa.stato}</Badge>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 16px 0' }}>
        <Btn onClick={() => setStarted(!started)} color={started ? DS.amber : DS.teal}>
          {started ? '⏸ In corso — tocca per fermare' : '▶ Inizia montaggio'}
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: DS.white, borderBottom: `1.5px solid ${DS.border}`, overflowX: 'auto' }}>
        {TABS.map((t, i) => (
          <div key={i} onClick={() => setTab(i)} style={{ padding: '11px 14px', fontSize: 13, fontWeight: tab === i ? 700 : 500, color: tab === i ? DS.text : DS.textHint, whiteSpace: 'nowrap', borderBottom: `2.5px solid ${tab === i ? DS.teal : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }}>{t}</div>
        ))}
      </div>

      {/* TAB 0: MONTAGGIO */}
      {tab === 0 && (
        <div>
          {commessa.vani.map(vano => (
            <div key={vano.id} style={{ margin: '12px 16px 0', background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, overflow: 'hidden' }}>
              <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: DS.teal, textTransform: 'uppercase', letterSpacing: '.8px' }}>Disegno tecnico</div>
                  <div style={{ fontSize: 11, color: '#ffffff60' }}>{vano.label} · {vano.larghezza}×{vano.altezza}</div>
                </div>
                <Badge bg={vano.stato === 'in_corso' ? DS.amberLight : DS.tealLight} color={vano.stato === 'in_corso' ? '#92400E' : DS.tealDark}>{vano.stato === 'in_corso' ? 'In montaggio' : 'In attesa'}</Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 14 }}>
                <DisegnoVano vano={vano} tipo="attuale" />
                <DisegnoVano vano={vano} tipo="futuro" />
              </div>
              {vano.note && (
                <div style={{ padding: '0 14px 14px' }}>
                  <div style={{ background: DS.amberBg, borderLeft: `3px solid ${DS.amber}`, borderRadius: '0 10px 10px 0', padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Attenzione montatori</div>
                    <div style={{ fontSize: 13, color: '#451A03', lineHeight: 1.6 }}>{vano.note}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <SectionTitle>Azioni rapide</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
            {[
              { label: 'Naviga', sub: `${commessa.indirizzo}, ${commessa.citta}`, bg: DS.tealBg, ic: DS.teal, ico: 'nav' },
              { label: 'Chiama squadra', sub: commessa.squadra.join(', '), bg: DS.tealBg, ic: DS.teal, ico: 'call', onClick: () => setModal(<ModalCall nome="Squadra" />) },
              { label: 'Allegati', sub: 'Schemi, foto, PDF', bg: DS.blueBg, ic: DS.blue, ico: 'doc' },
              { label: 'Segnala problema', sub: 'Urgente', bg: DS.redBg, ic: DS.red, ico: 'warn', danger: true },
            ].map(({ label, sub, bg, ic, ico, onClick, danger }: any) => (
              <div key={label} onClick={onClick} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${danger ? DS.redLight : DS.border}`, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', minHeight: 82, justifyContent: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" fill="none" stroke={ic} strokeWidth="2" viewBox="0 0 24 24">
                    {ico === 'nav' ? <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> : ico === 'call' ? <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-1.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /> : ico === 'doc' ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></> : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>}
                  </svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: danger ? DS.red : DS.text, textAlign: 'center' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 12 }} />
        </div>
      )}

      {/* TAB 1: WORKFLOW */}
      {tab === 1 && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { nome: 'Sopralluogo misure', chi: 'Paolo Greco · Geometra', quando: '2 Feb 10:00', nota: '2 vani OK. Soglia V2 da rabboccare.', stato: 'fatto' },
            { nome: 'Acconto pagato', chi: 'Mario Esposito · Cliente', quando: '5 Feb 15:00', nota: 'Acconto €960', stato: 'fatto' },
            { nome: 'Materiale in magazzino', chi: 'Antonio Bruno', quando: '15 Feb 08:00', stato: 'fatto' },
            { nome: 'Montaggio', chi: `${commessa.squadra[0]}`, quando: '19 Mar 09:00', stato: 'ora' },
          ].map(({ nome, chi, quando, nota, stato }) => (
            <div key={nome} style={{ background: DS.white, borderRadius: 12, border: `${stato === 'ora' ? `2px solid ${DS.teal}` : `1px solid ${DS.border}`}`, padding: 14, display: 'flex', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: stato === 'fatto' ? DS.greenLight : DS.tealLight, border: stato === 'ora' ? `2px solid ${DS.teal}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: stato === 'ora' ? DS.tealDark : DS.green }}>
                {stato === 'fatto' ? <svg width="16" height="16" fill="none" stroke={DS.green} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> : 'ORA'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div>
                  <Badge bg={stato === 'fatto' ? DS.greenLight : DS.amberLight} color={stato === 'fatto' ? '#065F46' : '#92400E'}>{stato === 'fatto' ? 'Fatto' : 'In attesa'}</Badge>
                </div>
                <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{chi} · {quando}</div>
                {nota && <div style={{ fontSize: 12, color: '#374151', background: DS.bg, borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>{nota}</div>}
                {stato === 'ora' && <Btn style={{ marginTop: 10, padding: 12, fontSize: 14, borderRadius: 10 }} onClick={() => setStarted(true)}>Inizia adesso</Btn>}
                {stato === 'fatto' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setModal(<ModalCall nome={chi} />)} style={{ background: DS.tealBg, color: DS.tealDark, border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 12, fontWeight: 600, fontFamily: DS.font, cursor: 'pointer' }}>📞 Chiama</button>
                    <button onClick={() => setModal(<ModalMsg nome={chi} />)} style={{ background: DS.blueBg, color: '#1D4ED8', border: 'none', borderRadius: 20, padding: '8px 14px', fontSize: 12, fontWeight: 600, fontFamily: DS.font, cursor: 'pointer' }}>💬 Messaggio</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TEAM */}
      {tab === 2 && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEAM_MOCK.map(({ nome, ruolo, iniziale }) => (
            <div key={nome} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: DS.tealLight, color: DS.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{iniziale}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div>
                <div style={{ fontSize: 12, color: DS.textMuted }}>{ruolo}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ bg: DS.tealBg, ic: DS.teal, onClick: () => setModal(<ModalCall nome={nome} />) }, { bg: DS.blueBg, ic: DS.blue, onClick: () => setModal(<ModalMsg nome={nome} />) }].map(({ bg, ic, onClick }, i) => (
                  <button key={i} onClick={onClick} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <svg width="20" height="20" fill="none" stroke={ic} strokeWidth="2" viewBox="0 0 24 24">
                      {i === 0 ? <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-1.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /> : <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.redLight}`, padding: 14, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DS.red, marginBottom: 10 }}>Segnala problema urgente</div>
            <textarea style={{ width: '100%', border: `1.5px solid ${DS.redLight}`, borderRadius: 10, padding: 10, fontSize: 13, fontFamily: DS.font, height: 80, resize: 'none', outline: 'none', background: '#FFF8F8' }} placeholder="Descrivi..." />
            <Btn style={{ marginTop: 8, padding: 14 }} color={DS.red}>Invia urgente</Btn>
          </div>
        </div>
      )}

      {/* TAB 3: COMUNICAZIONI */}
      {tab === 3 && (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {commessa.comunicazioni.map(c => {
            const colori: Record<string, any> = { chiamata: { bg: DS.tealBg, color: DS.teal, border: DS.teal }, whatsapp: { bg: DS.blueBg, color: '#1D4ED8', border: DS.blue }, email: { bg: DS.amberBg, color: '#C2410C', border: DS.amber } }
            const col = colori[c.tipo] || { bg: DS.bg, color: DS.text, border: DS.textMuted }
            return (
              <div key={c.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: '12px 14px', borderLeft: `3px solid ${col.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.text }}>{c.da} → {c.a}</div>
                  <Badge bg={col.bg} color={col.color}>{c.tipo}{c.durata ? ` · ${c.durata}` : ''}</Badge>
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>{c.testo}</div>
                <div style={{ fontSize: 11, color: DS.textHint, marginTop: 3 }}>{c.data}</div>
              </div>
            )
          })}
          <button onClick={() => setModal(<ModalMsg nome={commessa.cliente} />)} style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 12, padding: 14, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font }}>
            + Invia messaggio / nota
          </button>
        </div>
      )}

      {/* TAB 4: TASK */}
      {tab === 4 && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{ background: DS.tealBg, borderRadius: 10, padding: '10px 12px', marginBottom: 12, borderLeft: `3px solid ${DS.teal}`, fontSize: 12, color: '#065F46' }}>
            Task da commessa arrivano in automatico dall'ERP. Task libere le aggiungi tu.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(t => (
              <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
                <div onClick={() => toggleTask(t.id)} style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1 }}>
                  {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                  {t.fonte && <div style={{ fontSize: 11, color: DS.textHint, marginTop: 2 }}>{t.fonte}</div>}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : t.tipo === 'ritorno' ? DS.amberLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : t.tipo === 'ritorno' ? '#92400E' : '#1D4ED8' }}>
                    {t.tipo === 'commessa' ? 'Commessa' : t.tipo === 'ritorno' ? 'Ritorno' : 'Libera'}
                  </span>
                </div>
              </div>
            ))}
            <button style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font }}>+ Aggiungi task manuale</button>
          </div>
        </div>
      )}

      {/* TAB 5: FIRMA */}
      {tab === 5 && (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ background: DS.tealBg, borderRadius: 12, padding: '12px 14px', marginBottom: 14, borderLeft: `3px solid ${DS.teal}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', marginBottom: 2 }}>Firma digitale finale</div>
            <div style={{ fontSize: 12, color: '#166534' }}>Il cliente firma il collaudo. Inviato automaticamente a cliente + ERP + copia locale.</div>
          </div>

          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Riepilogo lavori</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              {commessa.codice} · {commessa.cliente}<br />
              {commessa.vani.map(v => `${v.label}: ${v.larghezza}×${v.altezza} montata`).join('\n')}<br />
              Collaudo effettuato · {commessa.data}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${DS.border}` }}>
              <div style={{ fontSize: 13, color: DS.textMuted }}>Saldo residuo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>€{commessa.saldoResiduo.toLocaleString('it-IT')}</div>
            </div>
          </Card>

          <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Firma cliente</div>
          {firmaOk ? (
            <div style={{ background: DS.tealBg, borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DS.tealDark, marginBottom: 4 }}>✓ Firma acquisita</div>
              <div style={{ fontSize: 13, color: '#065F46' }}>Inviata a {commessa.emailCliente}<br />Salvata in archivio ERP e in app</div>
            </div>
          ) : (
            <FirmaCanvas onFirmaCompleta={() => setFirmaOk(true)} />
          )}

          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Dopo la firma viene inviato a:</div>
            {[`${commessa.emailCliente} · PDF collaudo`, 'Walter Cozza Serramenti · archivio ERP', 'Copia in MASTRO MONTAGGI · offline'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', marginBottom: 4 }}>
                <svg width="16" height="16" fill="none" stroke={DS.teal} strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                {t}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
type Screen = 'home' | 'commessa' | 'calendario'

export default function MastroMontaggi() {
  const [screen, setScreen] = useState<Screen>('home')
  const [navActive, setNavActive] = useState(0)

  const goTo = (s: Screen, n: number) => { setScreen(s); setNavActive(n) }

  const NAV_ITEMS = [
    { label: 'Home', screen: 'home' as Screen, n: 0, icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { label: 'Calendario', screen: 'calendario' as Screen, n: 1, icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { label: 'Task', screen: 'commessa' as Screen, n: 2, icon: <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
    { label: 'Commessa', screen: 'commessa' as Screen, n: 3, icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
  ]

  return (
    <div style={{ background: DS.bg, minHeight: '100vh', maxWidth: 430, margin: '0 auto', fontFamily: DS.font, position: 'relative' }}>
      {screen === 'home' && <HomeScreen onOpenCommessa={() => goTo('commessa', 3)} onOpenCalendario={() => goTo('calendario', 1)} />}
      {screen === 'commessa' && <CommessaScreen commessa={COMMESSA_MOCK} onBack={() => goTo('home', 0)} />}
      {screen === 'calendario' && <CalendarioScreen onBack={() => goTo('home', 0)} onOpenCommessa={() => goTo('commessa', 3)} />}

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: DS.white, borderTop: `1px solid ${DS.border}`, display: 'flex', zIndex: 50 }}>
        {NAV_ITEMS.map(({ label, screen: s, n, icon }) => (
          <div key={label} onClick={() => goTo(s, n)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 14px', cursor: 'pointer', color: navActive === n ? DS.teal : DS.textHint, fontSize: 10, fontWeight: 600 }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{icon}</svg>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

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

interface Commessa {
  id: string; code: string; cliente: string; cognome: string
  saldo_residuo: number; totale_finale: number
  contatto_id: string
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
  colore_int: string; colore_est: string; note: string
  misure_json: any
}
interface Comunicazione {
  id: string; da_nome: string; a_nome: string
  tipo: string; testo: string; created_at: string
}
interface LavorazioneRow {
  id: string; fase_nome: string; fase_colore: string
  operatore_nome: string; stato: string; note: string|null; completato_at: string|null
}

function useMastroMontaggi(operatoreId: string, aziendaId: string) {
  const sb = createClientComponentClient()
  const [montaggiOggi, setMontaggiOggi] = useState<Montaggio[]>([])
  const [taskOggi, setTaskOggi] = useState<TaskMontaggio[]>([])
  const [loading, setLoading] = useState(true)
  const subRef = useRef<any>(null)
  const oggi = new Date().toISOString().split('T')[0]

  const fetchMontaggi = useCallback(async () => {
    const { data } = await sb.from('montaggi')
      .select('*')
      .eq('azienda_id', aziendaId)
      .eq('data_montaggio', oggi)
      .order('ora_inizio')

    if (!data) return
    // Fetch commesse separatamente
    const commessaIds = Array.from(new Set(data.map((m: any) => m.commessa_id).filter(Boolean)))
    let commesseMap: Record<string, any> = {}
    let contattiMap: Record<string, any> = {}

    if (commessaIds.length > 0) {
      const { data: commesse } = await sb.from('commesse')
        .select('id,code,cliente,cognome,saldo_residuo,totale_finale,contatto_id')
        .in('id', commessaIds)
      if (commesse) {
        commesse.forEach((c: any) => { commesseMap[c.id] = c })
        const contattoIds = Array.from(new Set(commesse.map((c: any) => c.contatto_id).filter(Boolean)))
        if (contattoIds.length > 0) {
          const { data: contatti } = await sb.from('contatti')
            .select('id,indirizzo,citta,telefono,email')
            .in('id', contattoIds)
          if (contatti) contatti.forEach((c: any) => { contattiMap[c.id] = c })
        }
      }
    }

    const mapped: Montaggio[] = data.map((m: any) => {
      const commessa = commesseMap[m.commessa_id]
      return {
        ...m,
        commessa,
        contatto: commessa ? contattiMap[commessa.contatto_id] : null,
      }
    })
    setMontaggiOggi(mapped)
  }, [sb, aziendaId, oggi])

  const fetchTask = useCallback(async () => {
    const { data } = await sb.from('task_montaggi')
      .select('*').eq('operatore_id', operatoreId).order('created_at')
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
    await sb.from('montaggi').update({ stato: 'programmato', avviato_at: null }).eq('id', id)
    await fetchMontaggi()
  }
  const toggleTask = async (id: string, fatto: boolean) => {
    await sb.from('task_montaggi').update({ fatto, fatto_at: fatto ? new Date().toISOString() : null }).eq('id', id)
    setTaskOggi(prev => prev.map(t => t.id === id ? { ...t, fatto } : t))
  }
  const addTask = async (testo: string, tipo: string) => {
    const { data } = await sb.from('task_montaggi').insert({
      azienda_id: aziendaId, operatore_id: operatoreId, testo, tipo
    }).select().single()
    if (data) setTaskOggi(prev => [...prev, data as TaskMontaggio])
  }
  const salvaFirma = async (params: { commessa_id: string; montaggio_id: string; firma_svg: string; cliente_nome: string; cliente_email: string; saldo_al_collaudo: number }) => {
    const { data } = await sb.from('firma_collaudo').insert({ ...params, azienda_id: aziendaId, inviato_cliente: false }).select().single()
    await sb.from('montaggi').update({ stato: 'completato', completato_at: new Date().toISOString() }).eq('id', params.montaggio_id)
    await fetchMontaggi()
    return data
  }

  return { loading, montaggiOggi, taskOggi, avviaMontaggio, fermaMontaggio, toggleTask, addTask, salvaFirma }
}

function useCommessaDetail(commessaId: string, aziendaId: string) {
  const sb = createClientComponentClient()
  const [vani, setVani] = useState<Vano[]>([])
  const [task, setTask] = useState<TaskMontaggio[]>([])
  const [comunicazioni, setComunicazioni] = useState<Comunicazione[]>([])
  const [lavorazioni, setLavorazioni] = useState<LavorazioneRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!commessaId) return
    Promise.all([
      sb.from('vani').select('id,nome,tipo,sistema,colore_int,colore_est,note,misure_json').eq('commessa_id', commessaId).order('ordine'),
      sb.from('task_montaggi').select('*').eq('commessa_id', commessaId).order('tipo'),
      sb.from('comunicazioni_commessa').select('*').eq('commessa_id', commessaId).order('created_at', { ascending: false }),
      sb.from('lavorazioni_commessa').select('*').eq('commessa_id', commessaId).order('created_at'),
    ]).then(([v, t, c, l]) => {
      setVani((v.data || []) as Vano[])
      setTask((t.data || []) as TaskMontaggio[])
      setComunicazioni((c.data || []) as Comunicazione[])
      setLavorazioni((l.data || []) as LavorazioneRow[])
      setLoading(false)
    })
  }, [commessaId, sb])

  return { loading, vani, task, comunicazioni, lavorazioni }
}

// UI Components
const Badge = ({ children, bg, color }: any) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{children}</span>
)
const Btn = ({ children, onClick, color = DS.teal, style = {} }: any) => (
  <button onClick={onClick} style={{ background: color, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 15, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', ...style }}>{children}</button>
)
const Card = ({ children, style = {}, onClick }: any) => (
  <div onClick={onClick} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, padding: 14, cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>
)
const Modal = ({ children, onClose }: any) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
    <div onClick={(e: any) => e.stopPropagation()} style={{ background: DS.white, borderRadius: '20px 20px 0 0', padding: '8px 20px 48px', width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border, margin: '8px auto 16px' }} />
      {children}
    </div>
  </div>
)

function FirmaCanvas({ onSalva }: { onSalva: (svg: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const paths = useRef<string[]>([])
  const [firmata, setFirmata] = useState(false)

  const getPos = (e: any, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect()
    const s = e.touches ? e.touches[0] : e
    return { x: s.clientX - r.left, y: s.clientY - r.top }
  }
  const start = (e: any) => { e.preventDefault(); drawing.current = true; last.current = getPos(e, ref.current!) }
  const draw = (e: any) => {
    e.preventDefault(); if (!drawing.current) return
    const c = ref.current!; const ctx = c.getContext('2d')!; const p = getPos(e, c)
    ctx.beginPath(); ctx.strokeStyle = DS.topbar; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    paths.current.push(`M${last.current.x},${last.current.y}L${p.x},${p.y}`)
    last.current = p; setFirmata(true)
  }
  const stop = () => { drawing.current = false }
  const clear = () => { ref.current!.getContext('2d')!.clearRect(0, 0, 340, 160); paths.current = []; setFirmata(false) }
  const salva = () => onSalva(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 160"><path d="${paths.current.join(' ')}" stroke="#0B1F2A" strokeWidth="2.5" fill="none"/></svg>`)

  return (
    <div>
      <div style={{ border: `2px dashed ${firmata ? DS.teal : DS.border}`, borderRadius: 12, height: 160, position: 'relative', overflow: 'hidden', background: DS.bg, cursor: 'crosshair', marginBottom: 10 }}>
        <canvas ref={ref} width={340} height={160} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
        {!firmata && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: DS.textHint, fontSize: 13, fontWeight: 600 }}>Tocca per firmare</div>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} style={{ flex: 1, background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 600, color: DS.textMuted, fontFamily: DS.font, cursor: 'pointer' }}>Cancella</button>
        <button onClick={firmata ? salva : undefined} style={{ flex: 2, background: firmata ? DS.teal : DS.border, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: DS.font, cursor: firmata ? 'pointer' : 'default' }}>Invia e salva firma</button>
      </div>
    </div>
  )
}

interface Props { operatoreId: string; operatoreNome: string; aziendaId: string; onLogout: () => void }

export default function MastroMontaggi({ operatoreId, operatoreNome, aziendaId, onLogout }: Props) {
  const oggi = new Date().toISOString().split('T')[0]
  const { loading, montaggiOggi, taskOggi, toggleTask, addTask, avviaMontaggio, fermaMontaggio, salvaFirma } = useMastroMontaggi(operatoreId, aziendaId)
  const [screen, setScreen] = useState<'home'|'commessa'|'calendario'>('home')
  const [activeMontaggio, setActiveMontaggio] = useState<Montaggio|null>(null)
  const [modal, setModal] = useState<any>(null)
  const [cmTab, setCmTab] = useState(0)
  const [started, setStarted] = useState(false)
  const [firmaOk, setFirmaOk] = useState(false)
  const { vani, task: cmTask, comunicazioni, lavorazioni } = useCommessaDetail(
    activeMontaggio?.commessa_id || '', aziendaId
  )

  const giornoLabel = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  const TABS = ['Montaggio', 'Workflow', 'Team', 'Comunicaz.', 'Task', 'Firma']

  const openCommessa = (m: Montaggio) => { setActiveMontaggio(m); setScreen('commessa'); setCmTab(0); setStarted(m.stato === 'in_corso') }
  const goHome = () => { setScreen('home'); setActiveMontaggio(null) }

  const nomeCliente = activeMontaggio ? `${activeMontaggio.commessa?.cliente || ''} ${activeMontaggio.commessa?.cognome || ''}`.trim() : ''

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: DS.font, color: DS.textMuted, background: DS.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: DS.teal, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div style={{ fontSize: 14 }}>Caricamento...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: DS.bg, minHeight: '100vh', maxWidth: 430, margin: '0 auto', fontFamily: DS.font }}>
      {modal && <Modal onClose={() => setModal(null)}>{modal}</Modal>}

      {screen === 'home' && (
        <div>
          <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>{operatoreNome[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Ciao, {operatoreNome}</div>
              <div style={{ fontSize: 11, color: '#ffffff60' }}>MASTRO MONTAGGI</div>
            </div>
            <div style={{ background: '#ffffff14', borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{montaggiOggi.length}</div>
              <div style={{ fontSize: 10, color: '#ffffff60' }}>oggi</div>
            </div>
            <button onClick={onLogout} style={{ background: '#ffffff14', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#ffffff90', fontSize: 12, cursor: 'pointer', fontFamily: DS.font }}>Esci</button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: DS.teal, textTransform: 'uppercase', letterSpacing: '.8px', padding: '14px 16px 6px' }}>
            OGGI · {giornoLabel.toUpperCase()}
          </div>

          {montaggiOggi.length === 0 ? (
            <div style={{ padding: '60px 16px', textAlign: 'center', color: DS.textHint }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏖️</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Nessun montaggio oggi</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Controlla il calendario</div>
            </div>
          ) : montaggiOggi.map(m => (
            <div key={m.id} onClick={() => openCommessa(m)} style={{ margin: '0 16px 10px', background: DS.white, borderRadius: 14, border: `1.5px solid ${m.stato === 'in_corso' ? DS.teal : DS.border}`, padding: 14, cursor: 'pointer' }}>
              {m.urgente && <div style={{ fontSize: 11, fontWeight: 700, color: DS.red, marginBottom: 4 }}>URGENTE</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>{m.commessa ? `${m.commessa.cliente} ${m.commessa.cognome}`.trim() : 'Commessa'}</div>
                  <div style={{ fontSize: 12, color: DS.textMuted }}>{m.contatto?.indirizzo || ''}{m.contatto?.citta ? `, ${m.contatto.citta}` : ''}</div>
                </div>
                <Badge bg={m.stato === 'in_corso' ? DS.tealLight : DS.amberLight} color={m.stato === 'in_corso' ? DS.tealDark : '#92400E'}>{m.stato}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: DS.textMuted }}>Ore {m.ora_inizio?.slice(0,5)}–{m.ora_fine?.slice(0,5)} · {(m.squadra||[]).join(', ')}</div>
                {m.commessa?.totale_finale && <div style={{ fontSize: 13, fontWeight: 700, color: DS.amber }}>€{m.commessa.totale_finale.toLocaleString('it-IT')}</div>}
              </div>
              {m.stato === 'in_corso' && <div style={{ height: 4, background: DS.teal, borderRadius: 2, marginTop: 10, width: '35%' }} />}
            </div>
          ))}

          <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', padding: '12px 16px 6px' }}>Task</div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {taskOggi.length === 0 && <div style={{ color: DS.textHint, fontSize: 13, padding: '8px 0' }}>Nessuna task — aggiungine una</div>}
            {taskOggi.map(t => (
              <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
                <div onClick={() => toggleTask(t.id, !t.fatto)} style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1 }}>
                  {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : t.tipo === 'ritorno' ? DS.amberLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : t.tipo === 'ritorno' ? '#92400E' : '#1D4ED8' }}>{t.tipo}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setModal(
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginBottom: 14 }}>Nuova task</div>
                <input id="nt" style={{ width: '100%', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: DS.font, outline: 'none', marginBottom: 10 }} placeholder="Descrivi..." />
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['libera','commessa','ritorno'] as const).map(tipo => (
                    <button key={tipo} onClick={async () => {
                      const txt = (document.getElementById('nt') as HTMLInputElement)?.value
                      if (txt) { await addTask(txt, tipo); setModal(null) }
                    }} style={{ flex: 1, background: DS.tealBg, color: DS.tealDark, border: 'none', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>{tipo}</button>
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

      {screen === 'commessa' && activeMontaggio && (
        <div>
          <div style={{ background: DS.topbar, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={goHome} style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff14', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{nomeCliente || 'Commessa'}</div>
              <div style={{ fontSize: 11, color: '#ffffff60' }}>{activeMontaggio.contatto?.indirizzo || ''}</div>
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

          {cmTab === 0 && (
            <div style={{ padding: '12px 16px' }}>
              {activeMontaggio.note_misuratore && (
                <div style={{ background: DS.amberBg, borderLeft: `3px solid ${DS.amber}`, borderRadius: '0 10px 10px 0', padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', marginBottom: 4 }}>Note misuratori</div>
                  <div style={{ fontSize: 13, color: '#451A03' }}>{activeMontaggio.note_misuratore}</div>
                </div>
              )}
              {vani.length === 0 ? <Card><div style={{ color: DS.textMuted, fontSize: 13 }}>Nessun vano</div></Card>
              : vani.map(v => (
                <Card key={v.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.text, marginBottom: 4 }}>{v.nome}</div>
                  <div style={{ fontSize: 12, color: DS.textMuted }}>{v.tipo} · {v.sistema} · {v.colore_est}</div>
                  {v.note && <div style={{ fontSize: 12, color: '#374151', marginTop: 6, fontStyle: 'italic' }}>{v.note}</div>}
                </Card>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {[
                  { label: 'Naviga', bg: DS.tealBg, ic: DS.teal },
                  { label: 'Chiama', bg: DS.tealBg, ic: DS.teal, onClick: () => setModal(<div style={{textAlign:'center',padding:'8px 0'}}><div style={{fontSize:32,marginBottom:8}}>📞</div><Btn onClick={() => setModal(null)}>Chiama squadra</Btn></div>) },
                  { label: 'Allegati', bg: DS.blueBg, ic: DS.blue },
                  { label: 'Problema', bg: DS.redBg, ic: DS.red, danger: true, onClick: () => setModal(<div><div style={{fontSize:15,fontWeight:700,color:DS.red,marginBottom:12}}>Segnala problema</div><textarea style={{width:'100%',border:`1.5px solid ${DS.redLight}`,borderRadius:10,padding:10,fontSize:13,fontFamily:DS.font,height:80,resize:'none',outline:'none'}} placeholder="Descrivi..."/><Btn style={{marginTop:8}} color={DS.red} onClick={() => setModal(null)}>Invia urgente</Btn></div>) },
                ].map(({ label, bg, ic, onClick, danger }: any) => (
                  <div key={label} onClick={onClick} style={{ background: DS.white, borderRadius: 14, border: `1px solid ${danger ? DS.redLight : DS.border}`, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', minHeight: 78, justifyContent: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" fill="none" stroke={ic} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: danger ? DS.red : DS.text }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cmTab === 1 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lavorazioni.length > 0 && (
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 10 }}>Produzione</div>
                  {lavorazioni.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${DS.border}` }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.fase_colore || DS.teal, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: DS.text }}>{l.fase_nome}</div>
                        <div style={{ fontSize: 11, color: DS.textMuted }}>{l.operatore_nome}</div>
                      </div>
                      <Badge bg={l.stato === 'completato' ? '#D1FAE5' : DS.amberLight} color={l.stato === 'completato' ? '#065F46' : '#92400E'}>{l.stato}</Badge>
                    </div>
                  ))}
                </Card>
              )}
              <Card style={{ border: `2px solid ${DS.teal}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Montaggio</div>
                  <Badge bg={DS.amberLight} color="#92400E">In attesa</Badge>
                </div>
                <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>{(activeMontaggio.squadra||[]).join(', ')} · {activeMontaggio.ora_inizio?.slice(0,5)}</div>
                <Btn style={{ marginTop: 10, padding: 12, fontSize: 14, borderRadius: 10 }} onClick={async () => { await avviaMontaggio(activeMontaggio.id); setStarted(true) }}>Inizia adesso</Btn>
              </Card>
            </div>
          )}

          {cmTab === 2 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(activeMontaggio.squadra||[]).map((nome, i) => (
                <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: DS.tealLight, color: DS.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>{nome[0]}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div></div>
                  <button onClick={() => setModal(<div style={{textAlign:'center'}}><div style={{fontSize:32,marginBottom:8}}>📞</div><Btn onClick={()=>setModal(null)}>Chiama {nome}</Btn></div>)} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: DS.tealBg, cursor: 'pointer' }}>📞</button>
                </Card>
              ))}
            </div>
          )}

          {cmTab === 3 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comunicazioni.length === 0 && <div style={{ color: DS.textHint, fontSize: 13, padding: 20, textAlign: 'center' }}>Nessuna comunicazione</div>}
              {comunicazioni.map(c => (
                <div key={c.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: '12px 14px', borderLeft: `3px solid ${DS.teal}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 4 }}>{c.da_nome} → {c.a_nome}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>{c.testo}</div>
                  <div style={{ fontSize: 11, color: DS.textHint, marginTop: 3 }}>{new Date(c.created_at).toLocaleString('it-IT')}</div>
                </div>
              ))}
            </div>
          )}

          {cmTab === 4 && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cmTask.map(t => (
                <div key={t.id} style={{ background: DS.white, borderRadius: 12, border: `1px solid ${DS.border}`, padding: 14, display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: t.fatto ? 'none' : `2px solid ${DS.border}`, background: t.fatto ? DS.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {t.fatto && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.fatto ? DS.textHint : DS.text, textDecoration: t.fatto ? 'line-through' : 'none' }}>{t.testo}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4, background: t.tipo === 'commessa' ? DS.tealLight : DS.blueBg, color: t.tipo === 'commessa' ? DS.tealDark : '#1D4ED8' }}>{t.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cmTab === 5 && (
            <div style={{ padding: '14px 16px' }}>
              {firmaOk ? (
                <div style={{ background: DS.tealBg, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.tealDark, marginBottom: 4 }}>✓ Firma acquisita</div>
                  <div style={{ fontSize: 13, color: '#065F46' }}>Inviata e salvata</div>
                </div>
              ) : (
                <>
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Riepilogo</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                      {nomeCliente}<br/>{vani.length} vani · {new Date().toLocaleDateString('it-IT')}
                    </div>
                    {activeMontaggio.commessa?.totale_finale && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 10, borderTop: `1px solid ${DS.border}` }}>
                        <div style={{ fontSize: 13, color: DS.textMuted }}>Totale</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: DS.text }}>€{activeMontaggio.commessa.totale_finale.toLocaleString('it-IT')}</div>
                      </div>
                    )}
                  </Card>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Firma cliente</div>
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

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: DS.white, borderTop: `1px solid ${DS.border}`, display: 'flex', zIndex: 50 }}>
        {[
          { label: 'Home', s: 'home' as const },
          { label: 'Commessa', s: 'commessa' as const },
        ].map(({ label, s }) => (
          <div key={label} onClick={() => { if (s === 'commessa' && !activeMontaggio && montaggiOggi[0]) openCommessa(montaggiOggi[0]); else if (s !== 'commessa') setScreen(s) }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 4px 14px', cursor: 'pointer', color: screen === s ? DS.teal : DS.textHint, fontSize: 10, fontWeight: 600 }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {s === 'home' ? <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
            </svg>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

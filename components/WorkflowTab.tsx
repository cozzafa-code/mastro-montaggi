'use client'
import { useState } from 'react'

const DS = {
  teal: '#14B8A6', tealDark: '#0F766E', tealLight: '#CCFBF1', tealBg: '#F0FDF9',
  topbar: '#0B1F2A', bg: '#F8FAFC', white: '#FFFFFF',
  amber: '#D97706', amberLight: '#FEF3C7', amberBg: '#FFF7ED',
  red: '#DC2626', redLight: '#FEE2E2',
  blue: '#3B82F6', blueLight: '#DBEAFE', blueBg: '#EFF6FF',
  purple: '#8B5CF6', purpleLight: '#EDE9FE',
  text: '#0B1F2A', textMuted: '#64748B', textHint: '#94A3B8',
  border: '#E2E8F0', font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
}

// Tipi
interface Lavorazione {
  id: string
  fase_nome: string
  fase_colore: string
  operatore_nome: string
  stato: 'da_fare' | 'in_corso' | 'completato' | 'problema'
  note?: string
  completato_at?: string
  vano_label?: string
}

interface FaseProduzione {
  id: string
  nome: string
  colore: string
  ordine: number
}

interface WorkflowStep {
  nome: string
  chi: string
  quando: string
  nota?: string
  stato: 'fatto' | 'ora' | 'attesa'
}

// Dati mock produzione (in produzione: Supabase lavorazioni_commessa)
const FASI_DEFAULT: FaseProduzione[] = [
  { id: 'f1', nome: 'Taglio', colore: '#3B82F6', ordine: 1 },
  { id: 'f2', nome: 'Saldatura', colore: '#F59E0B', ordine: 2 },
  { id: 'f3', nome: 'Vetri', colore: '#14B8A6', ordine: 3 },
  { id: 'f4', nome: 'Verniciatura', colore: '#8B5CF6', ordine: 4 },
  { id: 'f5', nome: 'Controllo qualita', colore: '#10B981', ordine: 5 },
  { id: 'f6', nome: 'Imballaggio', colore: '#6B7280', ordine: 6 },
]

const LAVORAZIONI_MOCK: Lavorazione[] = [
  { id: 'l1', fase_nome: 'Taglio', fase_colore: '#3B82F6', operatore_nome: 'Giovanni Rea', stato: 'completato', completato_at: '10 Mar 08:30', vano_label: 'Vano 1 + Vano 2' },
  { id: 'l2', fase_nome: 'Saldatura', fase_colore: '#F59E0B', operatore_nome: 'Marco Vito', stato: 'completato', completato_at: '10 Mar 11:00', vano_label: 'Vano 1 + Vano 2' },
  { id: 'l3', fase_nome: 'Vetri', fase_colore: '#14B8A6', operatore_nome: 'Antonio Bruno', stato: 'completato', completato_at: '12 Mar 14:00', note: 'Vetro basso emissivo 4/16/4' },
  { id: 'l4', fase_nome: 'Verniciatura', fase_colore: '#8B5CF6', operatore_nome: 'Giovanni Rea', stato: 'completato', completato_at: '13 Mar 09:00', note: 'RAL 9016 satinat' },
  { id: 'l5', fase_nome: 'Controllo qualita', fase_colore: '#10B981', operatore_nome: 'Fabio Cozza', stato: 'completato', completato_at: '14 Mar 16:00' },
  { id: 'l6', fase_nome: 'Imballaggio', fase_colore: '#6B7280', operatore_nome: 'Antonio Bruno', stato: 'completato', completato_at: '15 Mar 08:00', note: 'Pronto per consegna' },
]

const WORKFLOW_STEPS: WorkflowStep[] = [
  { nome: 'Sopralluogo misure', chi: 'Paolo Greco · Geometra', quando: '2 Feb 10:00', nota: '2 vani OK. Soglia V2 da rabboccare.', stato: 'fatto' },
  { nome: 'Preventivo inviato', chi: 'Fabio Cozza', quando: '3 Feb 09:00', stato: 'fatto' },
  { nome: 'Acconto pagato €960', chi: 'Mario Esposito · Cliente', quando: '5 Feb 15:00', stato: 'fatto' },
  { nome: 'Produzione completata', chi: 'Officina Walter Cozza', quando: '15 Mar 08:00', stato: 'fatto' },
  { nome: 'Materiale in magazzino', chi: 'Antonio Bruno', quando: '15 Mar 08:30', stato: 'fatto' },
  { nome: 'Montaggio', chi: 'Marco Vito', quando: '19 Mar 09:00', stato: 'ora' },
]

const statoColor = (s: string) => {
  if (s === 'completato') return { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' }
  if (s === 'in_corso') return { bg: DS.amberLight, color: '#92400E', dot: DS.amber }
  if (s === 'problema') return { bg: DS.redLight, color: '#991B1B', dot: DS.red }
  return { bg: DS.border, color: DS.textHint, dot: DS.textHint }
}

// Badge
const Badge = ({ children, bg, color }: any) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>{children}</span>
)

// ─── SEZIONE PRODUZIONE ───────────────────────────────────────────────────────
function ProduzionePipeline({ lavorazioni, fasi, onAddLavorazione }: {
  lavorazioni: Lavorazione[]
  fasi: FaseProduzione[]
  onAddLavorazione: (fase: FaseProduzione) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ background: DS.white, borderRadius: 14, border: `1px solid ${DS.border}`, overflow: 'hidden', marginBottom: 8 }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expanded ? `1px solid ${DS.border}` : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="#7C3AED" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>Produzione</div>
            <div style={{ fontSize: 11, color: DS.textMuted }}>{lavorazioni.filter(l => l.stato === 'completato').length}/{lavorazioni.length} fasi completate</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge bg="#D1FAE5" color="#065F46">Completata</Badge>
          <svg width="16" height="16" fill="none" stroke={DS.textHint} strokeWidth="2" viewBox="0 0 24 24">
            {expanded ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 14 }}>
          {/* Progress bar */}
          <div style={{ background: DS.border, borderRadius: 4, height: 6, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ background: DS.teal, height: '100%', borderRadius: 4, width: `${(lavorazioni.filter(l => l.stato === 'completato').length / lavorazioni.length) * 100}%`, transition: 'width .3s' }} />
          </div>

          {/* Fasi pipeline orizzontale */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {fasi.map((f, i) => {
              const lav = lavorazioni.find(l => l.fase_nome === f.nome)
              const done = lav?.stato === 'completato'
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? f.colore : DS.bg, border: `2px solid ${done ? f.colore : DS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                      {done
                        ? <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span style={{ fontSize: 10, fontWeight: 700, color: DS.textHint }}>{i + 1}</span>
                      }
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: done ? DS.text : DS.textHint, whiteSpace: 'nowrap' }}>{f.nome}</div>
                  </div>
                  {i < fasi.length - 1 && <div style={{ width: 16, height: 2, background: done ? f.colore : DS.border, flexShrink: 0, marginTop: -12 }} />}
                </div>
              )
            })}
          </div>

          {/* Lista lavorazioni dettaglio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lavorazioni.map(l => {
              const c = statoColor(l.stato)
              return (
                <div key={l.id} style={{ background: DS.bg, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.fase_colore, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>{l.fase_nome}</div>
                      <Badge bg={c.bg} color={c.color}>{l.stato === 'completato' ? 'Fatto' : l.stato === 'in_corso' ? 'In corso' : l.stato === 'problema' ? 'Problema' : 'Da fare'}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>
                      {l.operatore_nome}{l.vano_label ? ` · ${l.vano_label}` : ''}{l.completato_at ? ` · ${l.completato_at}` : ''}
                    </div>
                    {l.note && <div style={{ fontSize: 12, color: '#374151', marginTop: 3, fontStyle: 'italic' }}>{l.note}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Aggiungi lavorazione */}
          <button onClick={() => onAddLavorazione(fasi[0])} style={{ width: '100%', background: DS.bg, border: `1.5px dashed ${DS.border}`, borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, color: DS.textMuted, cursor: 'pointer', fontFamily: DS.font, marginTop: 10 }}>
            + Aggiungi lavorazione
          </button>
        </div>
      )}
    </div>
  )
}

// ─── WORKFLOW TAB COMPLETO ────────────────────────────────────────────────────
export function WorkflowTab({ commessaId, onAvvia }: { commessaId: string; onAvvia: () => void }) {
  const [lavorazioni, setLavorazioni] = useState<Lavorazione[]>(LAVORAZIONI_MOCK)
  const [modal, setModal] = useState<any>(null)

  const addLavorazione = (fase: FaseProduzione) => {
    setModal(
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: DS.text, marginBottom: 14 }}>Nuova lavorazione</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 6 }}>Fase</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FASI_DEFAULT.map(f => (
              <div key={f.id} style={{ padding: '6px 12px', borderRadius: 20, border: `2px solid ${f.colore}`, fontSize: 12, fontWeight: 600, color: f.colore, cursor: 'pointer' }}>{f.nome}</div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 6 }}>Operatore</div>
          <select style={{ width: '100%', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: 10, fontSize: 14, fontFamily: DS.font, outline: 'none', background: DS.white }}>
            <option>Giovanni Rea</option>
            <option>Marco Vito</option>
            <option>Antonio Bruno</option>
            <option>Fabio Cozza</option>
          </select>
        </div>
        <textarea placeholder="Note (opzionale)..." style={{ width: '100%', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: 10, fontSize: 14, fontFamily: DS.font, height: 70, resize: 'none', outline: 'none', marginBottom: 10 }} />
        <button onClick={() => setModal(null)} style={{ width: '100%', background: DS.teal, color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>
          Salva lavorazione
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: DS.white, borderRadius: '20px 20px 0 0', padding: '12px 20px 48px', width: '100%', maxWidth: 430 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: DS.border, margin: '0 auto 16px' }} />
            {modal}
          </div>
        </div>
      )}

      {/* Steps commessa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {WORKFLOW_STEPS.map(({ nome, chi, quando, nota, stato }) => (
          <div key={nome} style={{ background: DS.white, borderRadius: 12, border: `${stato === 'ora' ? `2px solid ${DS.teal}` : `1px solid ${DS.border}`}`, padding: 14, display: 'flex', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: stato === 'fatto' ? '#D1FAE5' : DS.tealLight, border: stato === 'ora' ? `2px solid ${DS.teal}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: stato === 'ora' ? DS.tealDark : '#059669' }}>
              {stato === 'fatto'
                ? <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : stato === 'ora' ? 'ORA' : '...'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{nome}</div>
                <Badge bg={stato === 'fatto' ? '#D1FAE5' : DS.amberLight} color={stato === 'fatto' ? '#065F46' : '#92400E'}>{stato === 'fatto' ? 'Fatto' : 'In attesa'}</Badge>
              </div>
              <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>{chi} · {quando}</div>
              {nota && <div style={{ fontSize: 12, color: '#374151', background: DS.bg, borderRadius: 8, padding: '7px 10px', marginTop: 8 }}>{nota}</div>}
              {stato === 'ora' && (
                <button onClick={onAvvia} style={{ width: '100%', background: DS.teal, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', marginTop: 10 }}>
                  Inizia adesso
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SEZIONE PRODUZIONE */}
      <div style={{ fontSize: 11, fontWeight: 700, color: DS.textHint, textTransform: 'uppercase', letterSpacing: '.7px', margin: '16px 0 8px' }}>
        Chi ha lavorato — Produzione
      </div>
      <ProduzionePipeline
        lavorazioni={lavorazioni}
        fasi={FASI_DEFAULT}
        onAddLavorazione={addLavorazione}
      />

      <div style={{ background: DS.tealBg, borderRadius: 12, padding: '10px 12px', borderLeft: `3px solid ${DS.teal}`, fontSize: 12, color: '#065F46', marginTop: 8 }}>
        Le fasi di produzione sono configurabili per ogni azienda in Impostazioni → Workflow
      </div>
    </div>
  )
}

export default WorkflowTab

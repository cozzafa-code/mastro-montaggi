'use client';
import React from 'react';

// ─── TIPI MATERIALE ───────────────────────────────────────────────────────────
export type Materiale = 'pvc'|'alluminio'|'legno'|'vetro'|'acciaio'|'composito'|'zanzariera'|'persiana';
export type FormatoSerramento = 'finestra'|'porta'|'portafinestra'|'persiana'|'zanzariera'|'velux'|'scorrevole';

interface MatConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  abbr: string;
}

interface FormatoConfig {
  label: string;
  svg: (color:string) => React.ReactNode;
}

// ─── CONFIGURAZIONI ───────────────────────────────────────────────────────────
export const MATERIALI: Record<Materiale, MatConfig> = {
  pvc:        { label:'PVC',        color:'#475569', bg:'#F1F5F9', border:'#CBD5E1', abbr:'P' },
  alluminio:  { label:'Alluminio',  color:'#374151', bg:'#E5E7EB', border:'#9CA3AF', abbr:'A' },
  legno:      { label:'Legno',      color:'#92400E', bg:'#FEF3C7', border:'#D97706', abbr:'L' },
  vetro:      { label:'Vetro',      color:'#0369A1', bg:'#E0F2FE', border:'#38BDF8', abbr:'V' },
  acciaio:    { label:'Acciaio',    color:'#1F2937', bg:'#F3F4F6', border:'#6B7280', abbr:'X' },
  composito:  { label:'Composito',  color:'#0F766E', bg:'#CCFBF1', border:'#2DD4BF', abbr:'C' },
  zanzariera: { label:'Zanzariera', color:'#065F46', bg:'#D1FAE5', border:'#34D399', abbr:'Z' },
  persiana:   { label:'Persiana',   color:'#78350F', bg:'#FEF3C7', border:'#F59E0B', abbr:'PS' },
};

const FORMATI: Record<FormatoSerramento, FormatoConfig> = {
  finestra: {
    label: 'Finestra',
    svg: (c) => (
      <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
        <rect x="1" y="1" width="18" height="16" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
        <line x1="10" y1="1" x2="10" y2="17" stroke={c} strokeWidth="1.2"/>
        <line x1="1" y1="9" x2="19" y2="9" stroke={c} strokeWidth="1.2"/>
        <circle cx="10" cy="9" r="1.2" fill={c}/>
      </svg>
    ),
  },
  porta: {
    label: 'Porta',
    svg: (c) => (
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
        <rect x="1" y="1" width="12" height="18" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
        <circle cx="10.5" cy="10" r="1.2" fill={c}/>
        <line x1="1" y1="6" x2="13" y2="6" stroke={c} strokeWidth="1"/>
      </svg>
    ),
  },
  portafinestra: {
    label: 'Portafinestra',
    svg: (c) => (
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
        <rect x="1" y="1" width="10" height="18" rx="1.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="13" y="1" width="10" height="18" rx="1.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <line x1="1" y1="9" x2="11" y2="9" stroke={c} strokeWidth="1"/>
        <circle cx="10.5" cy="9" r="1" fill={c}/>
        <circle cx="13.5" cy="9" r="1" fill={c}/>
      </svg>
    ),
  },
  persiana: {
    label: 'Persiana',
    svg: (c) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
        <line x1="3" y1="5" x2="15" y2="5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="9" x2="15" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="13" x2="15" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  zanzariera: {
    label: 'Zanzariera',
    svg: (c) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
        <path d="M3 3 L15 15 M3 7 L11 15 M7 3 L15 11 M3 11 L7 15 M11 3 L15 7" stroke={c} strokeWidth="0.8" opacity="0.6"/>
        <path d="M15 3 L3 15 M15 7 L7 15 M11 3 L3 11 M15 11 L11 15 M7 3 L3 7" stroke={c} strokeWidth="0.8" opacity="0.6"/>
      </svg>
    ),
  },
  velux: {
    label: 'Velux',
    svg: (c) => (
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M1 14 L10 2 L19 14" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <line x1="1" y1="14" x2="19" y2="14" stroke={c} strokeWidth="1.5"/>
        <line x1="10" y1="2" x2="10" y2="14" stroke={c} strokeWidth="1"/>
        <line x1="5" y1="8" x2="15" y2="8" stroke={c} strokeWidth="1"/>
      </svg>
    ),
  },
  scorrevole: {
    label: 'Scorrevole',
    svg: (c) => (
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
        <rect x="1" y="1" width="11" height="16" rx="1.5" stroke={c} strokeWidth="1.5" fill="none"/>
        <rect x="14" y="1" width="11" height="16" rx="1.5" stroke={c} strokeWidth="1.2" fill="none" strokeDasharray="2 1"/>
        <path d="M6 9 L9 7 L9 11 Z" fill={c}/>
        <path d="M20 9 L17 7 L17 11 Z" fill={c} opacity="0.4"/>
      </svg>
    ),
  },
};

// ─── SAFE LOOKUP HELPERS ──────────────────────────────────────────────────────
function safeMat(m: string | undefined | null): MatConfig {
  if (!m) return MATERIALI['pvc'];
  const k = m.toLowerCase().trim() as Materiale;
  return MATERIALI[k] || MATERIALI['pvc'];
}
function safeFmt(f: string | undefined | null): FormatoConfig {
  if (!f) return FORMATI['finestra'];
  const k = f.toLowerCase().trim() as FormatoSerramento;
  return FORMATI[k] || FORMATI['finestra'];
}
function safeMatKey(m: string | undefined | null): Materiale {
  if (!m) return 'pvc';
  const k = m.toLowerCase().trim() as Materiale;
  return MATERIALI[k] ? k : 'pvc';
}
function safeFmtKey(f: string | undefined | null): FormatoSerramento {
  if (!f) return 'finestra';
  const k = f.toLowerCase().trim() as FormatoSerramento;
  return FORMATI[k] ? k : 'finestra';
}

// ─── BADGE MATERIALE ──────────────────────────────────────────────────────────
export function BadgeMateriale({
  materiale, size='md',
}: { materiale: string; size?: 'sm'|'md'|'lg' }) {
  const mk = safeMatKey(materiale);
  const m = MATERIALI[mk];
  const sizes = { sm:{px:'4px 7px',fontSize:10,br:5}, md:{px:'5px 10px',fontSize:12,br:6}, lg:{px:'6px 13px',fontSize:14,br:8} };
  const s = sizes[size];
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:m.bg, border:`1.5px solid ${m.border}`, borderRadius:s.br,
      padding:s.px, flexShrink:0,
    }}>
      <MateriIcon materiale={mk} size={size==='sm'?10:size==='md'?12:14}/>
      <span style={{fontSize:s.fontSize, fontWeight:700, color:m.color, fontFamily:'system-ui'}}>{m.label}</span>
    </div>
  );
}

// ─── ICONA MATERIALE ──────────────────────────────────────────────────────────
export function MateriIcon({ materiale, size=14 }: { materiale:string; size?:number }) {
  const mk = safeMatKey(materiale);
  const m = MATERIALI[mk];
  // Rendering SVG specifico per materiale
  if (mk === 'pvc') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <rect x="3" y="4" width="8" height="6" rx="1" fill={m.color} opacity="0.25"/>
      <rect x="4" y="5" width="6" height="4" rx="0.5" stroke={m.color} strokeWidth="1" fill="none"/>
    </svg>
  );
  if (mk === 'alluminio') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <path d="M4 10 L7 4 L10 10" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="8" x2="9" y2="8" stroke={m.color} strokeWidth="1.2"/>
    </svg>
  );
  if (mk === 'legno') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <path d="M3 5 Q7 4 11 5" stroke={m.color} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M3 7 Q7 6.5 11 7" stroke={m.color} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M3 9 Q7 9.5 11 9" stroke={m.color} strokeWidth="1" strokeLinecap="round" fill="none"/>
    </svg>
  );
  if (mk === 'vetro') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <path d="M4 4 L10 10" stroke={m.color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <path d="M5 3 L11 9" stroke={m.color} strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
    </svg>
  );
  if (mk === 'zanzariera') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <path d="M3 3 L11 11 M3 7 L7 11 M7 3 L11 7" stroke={m.color} strokeWidth="0.8"/>
      <path d="M11 3 L3 11 M11 7 L7 11 M7 3 L3 7" stroke={m.color} strokeWidth="0.8"/>
    </svg>
  );
  if (mk === 'persiana') return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <line x1="3" y1="5" x2="11" y2="5" stroke={m.color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="8" x2="11" y2="8" stroke={m.color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="11" x2="11" y2="11" stroke={m.color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  // Default (acciaio, composito)
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={m.bg} stroke={m.border} strokeWidth="1.5"/>
      <text x="7" y="10" textAnchor="middle" fontSize="7" fontWeight="bold" fill={m.color} fontFamily="system-ui">{m.abbr}</text>
    </svg>
  );
}

// ─── ICONA FORMATO ────────────────────────────────────────────────────────────
export function FormatoIcon({ formato, materiale, size='md' }: {
  formato: string; materiale?: string; size?:'sm'|'md'|'lg';
}) {
  const m = materiale ? safeMat(materiale) : { color:'#475569', bg:'#F1F5F9', border:'#CBD5E1' };
  const f = safeFmt(formato);
  const scale = size==='sm'?0.75:size==='lg'?1.25:1;
  return (
    <div title={f.label} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',transform:`scale(${scale})`}}>
      {f.svg(m.color)}
    </div>
  );
}

// ─── CARD VANO CON MICRO-INDICATORI ──────────────────────────────────────────
interface VanoIndicatoreProps {
  nome: string;
  tipo: string;
  materiale?: string;
  formato?: string;
  stato: string;
  dimensioni?: string;
  children?: React.ReactNode;
}

const STATO_COLORI = {
  completato: { bg:'#D1FAE5', color:'#065F46', label:'Completato', dot:'#1A9E73' },
  in_corso:   { bg:'#FEF3C7', color:'#92400E', label:'In corso',   dot:'#D08008' },
  da_fare:    { bg:'#F3F4F6', color:'#4B5563', label:'Da fare',    dot:'#9CA3AF' },
};

export function CardVanoIndicatori({ nome, tipo, materiale, formato, stato, dimensioni, children }: VanoIndicatoreProps) {
  const sc = (STATO_COLORI as any)[stato] || STATO_COLORI['da_fare'];
  const mk = materiale ? safeMatKey(materiale) : null;
  const mat = mk ? MATERIALI[mk] : null;
  const fk = formato ? safeFmtKey(formato) : null;

  return (
    <div style={{
      background:'linear-gradient(145deg,#fff,#f4fcfc)',
      borderRadius:14, border:`1.5px solid ${mat?.border||'#C8E4E4'}`,
      boxShadow:`0 2px 8px rgba(40,160,160,.08), 0 0 0 0px ${mat?.border||'transparent'}`,
      padding:14, position:'relative', overflow:'hidden',
    }}>
      {/* Accent materiale — striscia verticale colorata */}
      {mat && (
        <div style={{
          position:'absolute', left:0, top:0, bottom:0, width:4,
          background:`linear-gradient(180deg, ${mat.border}, ${mat.color}44)`,
          borderRadius:'14px 0 0 14px',
        }}/>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,paddingLeft:mat?8:0}}>
        <div style={{flex:1}}>
          {/* Nome + formato icon */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            {fk && mk && (
              <FormatoIcon formato={fk} materiale={mk} size="sm"/>
            )}
            <span style={{fontWeight:700,color:'#0D1F1F',fontSize:15}}>{nome}</span>
          </div>
          {/* Tipo testo */}
          <div style={{color:'#4A7070',fontSize:12,marginBottom:6}}>{tipo}</div>
          {/* Badge materiale + dimensioni */}
          <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
            {mk && <BadgeMateriale materiale={mk} size="sm"/>}
            {dimensioni && (
              <span style={{fontFamily:'"JetBrains Mono",monospace',fontSize:11,color:'#4A7070',background:'#f3f4f6',borderRadius:5,padding:'2px 7px'}}>
                {dimensioni}
              </span>
            )}
          </div>
        </div>

        {/* Stato */}
        <div style={{background:sc.bg,borderRadius:20,padding:'3px 10px',display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:sc.dot}}/>
          <span style={{fontSize:11,fontWeight:700,color:sc.color}}>{sc.label}</span>
        </div>
      </div>

      {children}
    </div>
  );
}

// ─── MINI BADGE FORMATO (per liste compatte) ──────────────────────────────────
export function MiniVanoBadge({ materiale, formato }: { materiale?:string; formato?:string }) {
  if (!materiale && !formato) return null;
  const mk = materiale ? safeMatKey(materiale) : null;
  const mat = mk ? MATERIALI[mk] : null;
  const fk = formato ? safeFmtKey(formato) : null;
  return (
    <div style={{display:'flex',gap:4,alignItems:'center'}}>
      {fk && mk && <FormatoIcon formato={fk} materiale={mk} size="sm"/>}
      {mat && (
        <span style={{
          fontSize:9, fontWeight:700, color:mat.color,
          background:mat.bg, border:`1px solid ${mat.border}`,
          borderRadius:4, padding:'1px 5px', fontFamily:'system-ui',
        }}>{mat.label.toUpperCase()}</span>
      )}
    </div>
  );
}

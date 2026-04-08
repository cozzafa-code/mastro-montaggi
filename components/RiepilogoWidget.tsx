// RiepilogoWidget.tsx — Riepilogo configurabile per home freelance
'use client';
// @ts-nocheck
import React, { useState } from 'react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

const PERIODI = [
  { id:'oggi', label:'Oggi' },
  { id:'settimana', label:'Settimana' },
  { id:'mese', label:'Mese' },
  { id:'anno', label:'Anno' },
];

const VISTE = [
  { id:'generale', label:'Generale' },
  { id:'ore', label:'Ore' },
  { id:'fatturato', label:'Fatturato' },
  { id:'commesse', label:'Per commessa' },
];

interface RiepilogoProps {
  commesse?: any[];
  fatture?: any[];
  spese?: any[];
  aziende?: any[];
}

export default function RiepilogoWidget({ commesse = [], fatture = [], spese = [], aziende = [] }: RiepilogoProps) {
  const [periodo, setPeriodo] = useState('settimana');
  const [vista, setVista] = useState('generale');
  const [showConfig, setShowConfig] = useState(false);

  // Mock dati per demo (in prod verranno da Supabase)
  const dati = {
    oggi: { ore: 6.5, lavori: 1, completati: 0, fatturato: 0, daIncassare: 1800, spese: 12.50 },
    settimana: { ore: 32, lavori: 4, completati: 2, fatturato: 3200, daIncassare: 2450, spese: 87.30 },
    mese: { ore: 128, lavori: 12, completati: 9, fatturato: 14800, daIncassare: 4200, spese: 342 },
    anno: { ore: 1420, lavori: 89, completati: 82, fatturato: 124000, daIncassare: 8900, spese: 4200 },
  };

  const orePerCommessa = [
    { nome: 'Villa Colombo', azienda: 'Walter Cozza', ore: 16, importo: 1800, stato: 'in_corso' },
    { nome: '120 infissi PVC', azienda: 'Infissi Sud', ore: 8, importo: 3200, stato: 'programmato' },
    { nome: 'Porta balcone Martini', azienda: 'Walter Cozza', ore: 2, importo: 200, stato: 'urgente' },
    { nome: 'Cond. Europa finestre', azienda: 'Serramenti Pro', ore: 6, importo: 2400, stato: 'completato' },
  ];

  const d = (dati as any)[periodo] || dati.settimana;
  const periodoLabel = PERIODI.find(p => p.id === periodo)?.label || '';

  const card = { background:'linear-gradient(145deg,#fff,#f4fcfc)', borderRadius:14, border:'1.5px solid '+DS.border, boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14 };
  const fmt = (n:any) => n.toLocaleString('it-IT');

  // ─── VISTA GENERALE ────────────────────────────────────────
  const renderGenerale = () => (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {[
        { label:'Ore lavorate', val:d.ore+'h', color:DS.teal, icon:'clock' },
        { label:'Lavori', val:d.completati+'/'+d.lavori, color:DS.green, icon:'check' },
        { label:'Fatturato', val:'EUR '+fmt(d.fatturato), color:DS.teal, icon:'euro' },
        { label:'Da incassare', val:'EUR '+fmt(d.daIncassare), color:DS.amber, icon:'wait' },
      ].map(k => (
        <div key={k.label} style={{ ...card, padding:10, textAlign:'center' }}>
          <div style={{ fontSize:10, color:DS.textLight, fontWeight:600, marginBottom:4 }}>{k.label}</div>
          <div style={{ fontFamily:DS.mono, fontWeight:800, fontSize:15, color:k.color }}>{k.val}</div>
        </div>
      ))}
    </div>
  );

  // ─── VISTA ORE ─────────────────────────────────────────────
  const renderOre = () => (
    <div style={{ ...card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:700, color:DS.text }}>Ore {periodoLabel.toLowerCase()}</span>
        <span style={{ fontFamily:DS.mono, fontWeight:800, fontSize:20, color:DS.teal }}>{d.ore}h</span>
      </div>
      <div style={{ height:8, borderRadius:4, background:DS.tealLight, overflow:'hidden', marginBottom:8 }}>
        <div style={{ height:'100%', borderRadius:4, background:DS.teal, width:Math.min(100, (d.ore / (periodo === 'oggi' ? 8 : periodo === 'settimana' ? 40 : 160)) * 100)+'%' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:DS.textMid }}>
        <span>{d.ore}h lavorate</span>
        <span>{periodo === 'oggi' ? '8h' : periodo === 'settimana' ? '40h' : '160h'} obiettivo</span>
      </div>
      {periodo !== 'oggi' && (
        <div style={{ marginTop:10, fontSize:12, color:DS.textMid }}>
          Media: <span style={{ fontFamily:DS.mono, fontWeight:700, color:DS.text }}>
            {(d.ore / (periodo === 'settimana' ? 5 : periodo === 'mese' ? 22 : 250)).toFixed(1)}h/giorno
          </span>
        </div>
      )}
    </div>
  );

  // ─── VISTA FATTURATO ───────────────────────────────────────
  const renderFatturato = () => (
    <div style={{ ...card }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, color:DS.textLight, fontWeight:600 }}>Fatturato {periodoLabel.toLowerCase()}</div>
          <div style={{ fontFamily:DS.mono, fontWeight:800, fontSize:24, color:DS.green }}>EUR {fmt(d.fatturato)}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, color:DS.textLight, fontWeight:600 }}>Da incassare</div>
          <div style={{ fontFamily:DS.mono, fontWeight:800, fontSize:18, color:DS.amber }}>EUR {fmt(d.daIncassare)}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1, background:'rgba(26,158,115,0.08)', borderRadius:8, padding:8, textAlign:'center' }}>
          <div style={{ fontSize:10, color:DS.textLight }}>Incassato</div>
          <div style={{ fontFamily:DS.mono, fontWeight:700, fontSize:13, color:DS.green }}>EUR {fmt(d.fatturato - d.daIncassare > 0 ? d.fatturato - d.daIncassare : 0)}</div>
        </div>
        <div style={{ flex:1, background:'rgba(220,68,68,0.08)', borderRadius:8, padding:8, textAlign:'center' }}>
          <div style={{ fontSize:10, color:DS.textLight }}>Spese</div>
          <div style={{ fontFamily:DS.mono, fontWeight:700, fontSize:13, color:DS.red }}>EUR {fmt(d.spese)}</div>
        </div>
        <div style={{ flex:1, background:'rgba(40,160,160,0.08)', borderRadius:8, padding:8, textAlign:'center' }}>
          <div style={{ fontSize:10, color:DS.textLight }}>Netto</div>
          <div style={{ fontFamily:DS.mono, fontWeight:700, fontSize:13, color:DS.teal }}>EUR {fmt(d.fatturato - d.spese)}</div>
        </div>
      </div>
    </div>
  );

  // ─── VISTA PER COMMESSA ────────────────────────────────────
  const statoColor:any = { in_corso:DS.teal, programmato:DS.textMid, urgente:DS.red, completato:DS.green };
  const renderCommesse = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {orePerCommessa.map((c, i) => (
        <div key={i} style={{ ...card, padding:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:DS.text }}>{c.nome}</div>
              <div style={{ fontSize:11, color:DS.textMid, marginTop:1 }}>{c.azienda}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:DS.mono, fontWeight:800, fontSize:14, color:DS.teal }}>{c.ore}h</div>
              <div style={{ fontFamily:DS.mono, fontSize:11, color:DS.textMid }}>EUR {fmt(c.importo)}</div>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
            <span style={{
              background: statoColor[c.stato] ? `${statoColor[c.stato]}15` : DS.tealLight,
              color: statoColor[c.stato] || DS.textMid,
              borderRadius:20, padding:'2px 9px', fontSize:10, fontWeight:700
            }}>{c.stato.replace('_', ' ').toUpperCase()}</span>
            <span style={{ fontSize:10, color:DS.textLight }}>EUR {(c.importo / Math.max(c.ore, 1)).toFixed(0)}/h</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ ...card, padding:0, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'12px 14px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontWeight:800, fontSize:14, color:DS.text }}>Riepilogo</div>
        <button onClick={() => setShowConfig(!showConfig)} style={{
          background:'none', border:'none', cursor:'pointer', padding:4
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.textMid} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Filtro periodo */}
      <div style={{ display:'flex', gap:4, padding:'0 14px 8px' }}>
        {PERIODI.map(p => (
          <button key={p.id} onClick={() => setPeriodo(p.id)} style={{
            flex:1, padding:'6px 0', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:DS.ui,
            background: periodo === p.id ? DS.teal : DS.tealLight, color: periodo === p.id ? '#fff' : DS.textMid
          }}>{p.label}</button>
        ))}
      </div>

      {/* Filtro vista (collapsible) */}
      {showConfig && (
        <div style={{ display:'flex', gap:4, padding:'0 14px 10px' }}>
          {VISTE.map(v => (
            <button key={v.id} onClick={() => { setVista(v.id); setShowConfig(false); }} style={{
              flex:1, padding:'6px 0', borderRadius:8, border:`1px solid ${vista === v.id ? DS.teal : DS.border}`, fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:DS.ui,
              background: vista === v.id ? DS.tealLight : '#fff', color: vista === v.id ? DS.teal : DS.textMid
            }}>{v.label}</button>
          ))}
        </div>
      )}

      {/* Contenuto */}
      <div style={{ padding:'0 14px 14px' }}>
        {vista === 'generale' && renderGenerale()}
        {vista === 'ore' && renderOre()}
        {vista === 'fatturato' && renderFatturato()}
        {vista === 'commesse' && renderCommesse()}
      </div>
    </div>
  );
}

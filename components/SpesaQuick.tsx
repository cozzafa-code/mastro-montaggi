// SpesaQuick.tsx — Registrazione spese rapida dal cantiere
// PIN operatore → foto scontrino → importo → categoria → commessa → invio
'use client';
// @ts-nocheck
import React, { useState, useRef } from 'react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008', amberDark:'#A06005',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

const CATEGORIE = [
  { id:'materiale', label:'Materiale extra', icon:'M' },
  { id:'carburante', label:'Carburante', icon:'C' },
  { id:'vitto', label:'Pasto / Vitto', icon:'V' },
  { id:'pedaggio', label:'Pedaggio', icon:'P' },
  { id:'parcheggio', label:'Parcheggio', icon:'K' },
  { id:'attrezzatura', label:'Attrezzatura', icon:'A' },
  { id:'altro', label:'Altro', icon:'?' },
];

interface SpesaQuickProps {
  commessaId?: string;
  commessaCodice?: string;
  operatore?: string;
  onClose: () => void;
  onSend: (spesa: any) => void;
}

export default function SpesaQuick({ commessaId, commessaCodice, operatore, onClose, onSend }: SpesaQuickProps) {
  const [step, setStep] = useState<'foto'|'dati'|'conferma'|'done'>('foto');
  const [fotoB64, setFotoB64] = useState<string|null>(null);
  const [importo, setImporto] = useState('');
  const [categoria, setCategoria] = useState('materiale');
  const [nota, setNota] = useState('');
  const [vocale, setVocale] = useState<string|null>(null);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<any>(null);
  const mediaRef = useRef<any>(null);
  const chunksRef = useRef<any>([]);

  const scattaFoto = () => fileRef.current?.click();

  const onFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoB64(ev.target?.result as string);
      setStep('dati');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      mr.ondataavailable = (e: any) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVocale(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch { /* microfono non disponibile */ }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const invia = () => {
    const spesa = {
      id: 'SP-' + Date.now(),
      commessa_id: commessaId || null,
      commessa_codice: commessaCodice || null,
      operatore: operatore || 'Operatore',
      importo: parseFloat(importo),
      categoria,
      nota: nota.trim(),
      foto_url: fotoB64,
      vocale_url: vocale,
      created_at: new Date().toISOString(),
      stato: 'in_attesa', // in_attesa -> approvata -> rifiutata
    };
    onSend(spesa);
    setStep('done');
    setTimeout(onClose, 1500);
  };

  const card = { background:'linear-gradient(145deg,#fff,#f4fcfc)', borderRadius:14, border:'1.5px solid '+DS.border, boxShadow:'0 2px 8px rgba(40,160,160,.08)', padding:14 };

  // ─── STEP FOTO ─────────────────────────────────────────────
  if (step === 'foto') return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480, margin:'0 auto' }}>
        <div style={{ width:40, height:4, borderRadius:2, background:DS.border, margin:'0 auto 16px' }}/>
        <div style={{ fontWeight:800, fontSize:16, color:DS.text, marginBottom:4 }}>Registra spesa</div>
        <div style={{ fontSize:12, color:DS.textMid, marginBottom:16 }}>
          {commessaCodice ? `Commessa: ${commessaCodice}` : 'Spesa generica (senza commessa)'}
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={onFile}/>

        <button onClick={scattaFoto} style={{
          width:'100%', padding:'40px 20px', background:DS.tealLight, border:`2px dashed ${DS.teal}`,
          borderRadius:14, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:10
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2" strokeLinecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:14, color:DS.teal, fontFamily:DS.ui }}>Scatta foto scontrino</span>
          <span style={{ fontSize:11, color:DS.textMid }}>oppure scegli dalla galleria</span>
        </button>

        <button onClick={() => setStep('dati')} style={{
          width:'100%', marginTop:10, padding:12, background:'none', border:`1px solid ${DS.border}`,
          borderRadius:10, cursor:'pointer', fontSize:13, color:DS.textMid, fontFamily:DS.ui, fontWeight:600
        }}>
          Continua senza foto
        </button>

        <button onClick={onClose} style={{
          width:'100%', marginTop:8, padding:10, background:'none', border:'none',
          cursor:'pointer', fontSize:13, color:DS.textLight, fontFamily:DS.ui
        }}>
          Annulla
        </button>
      </div>
    </div>
  );

  // ─── STEP DATI ─────────────────────────────────────────────
  if (step === 'dati') return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480, margin:'0 auto', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:40, height:4, borderRadius:2, background:DS.border, margin:'0 auto 16px' }}/>
        <div style={{ fontWeight:800, fontSize:16, color:DS.text, marginBottom:16 }}>Dettagli spesa</div>

        {fotoB64 && (
          <div style={{ position:'relative', marginBottom:12 }}>
            <img src={fotoB64} alt="" style={{ width:'100%', maxHeight:120, objectFit:'cover', borderRadius:10 }}/>
            <button onClick={() => setFotoB64(null)} style={{
              position:'absolute', top:6, right:6, width:24, height:24, borderRadius:'50%',
              background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', cursor:'pointer', fontSize:14
            }}>x</button>
          </div>
        )}

        {/* Importo */}
        <div style={{ position:'relative', marginBottom:12 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:18, fontWeight:800, color:DS.teal }}>EUR</span>
          <input value={importo} onChange={e => setImporto(e.target.value)} type="number" inputMode="decimal" placeholder="0.00"
            style={{ width:'100%', padding:'14px 14px 14px 50px', border:`1.5px solid ${DS.border}`, borderRadius:10,
              fontSize:22, fontFamily:DS.mono, fontWeight:800, color:DS.text, outline:'none', boxSizing:'border-box' }}/>
        </div>

        {/* Categoria */}
        <div style={{ fontSize:11, color:DS.textLight, fontWeight:700, textTransform:'uppercase', marginBottom:6, letterSpacing:0.5 }}>Categoria</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          {CATEGORIE.map(cat => (
            <button key={cat.id} onClick={() => setCategoria(cat.id)} style={{
              padding:'8px 12px', borderRadius:20, border:`1.5px solid ${categoria === cat.id ? DS.teal : DS.border}`,
              background: categoria === cat.id ? DS.teal : '#fff', color: categoria === cat.id ? '#fff' : DS.text,
              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.ui
            }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Nota */}
        <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota (opzionale)" rows={2}
          style={{ width:'100%', padding:'10px 12px', border:`1.5px solid ${DS.border}`, borderRadius:10,
            fontSize:13, outline:'none', resize:'none', boxSizing:'border-box', fontFamily:DS.ui, marginBottom:10 }}/>

        {/* Voce */}
        <button onClick={recording ? stopRec : startRec} style={{
          width:'100%', padding:10, borderRadius:10, border:`1.5px solid ${recording ? DS.red : DS.border}`,
          background: recording ? 'rgba(220,68,68,0.1)' : '#fff', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:14
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={recording ? DS.red : DS.textMid} strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span style={{ fontSize:12, fontWeight:600, color: recording ? DS.red : DS.textMid, fontFamily:DS.ui }}>
            {recording ? 'Registrando... tap per fermare' : vocale ? 'Nota vocale registrata' : 'Aggiungi nota vocale'}
          </span>
        </button>

        {vocale && (
          <audio controls src={vocale} style={{ width:'100%', height:36, marginBottom:10 }}/>
        )}

        {/* Bottoni */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setStep('foto')} style={{
            flex:1, padding:12, background:DS.tealLight, color:DS.textMid, border:'none',
            borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:DS.ui, fontSize:13
          }}>Indietro</button>
          <button onClick={() => setStep('conferma')} disabled={!importo || parseFloat(importo) <= 0} style={{
            flex:2, padding:12, background: importo && parseFloat(importo) > 0 ? DS.teal : DS.border,
            color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer',
            fontFamily:DS.ui, fontSize:14, boxShadow: importo ? `0 4px 0 0 ${DS.tealDark}` : 'none'
          }}>Conferma</button>
        </div>
      </div>
    </div>
  );

  // ─── STEP CONFERMA ─────────────────────────────────────────
  if (step === 'conferma') {
    const catLabel = CATEGORIE.find(c => c.id === categoria)?.label || categoria;
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'flex-end' }}>
        <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480, margin:'0 auto' }}>
          <div style={{ width:40, height:4, borderRadius:2, background:DS.border, margin:'0 auto 16px' }}/>
          <div style={{ fontWeight:800, fontSize:16, color:DS.text, marginBottom:16 }}>Conferma spesa</div>

          <div style={{ ...card, marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:13, color:DS.textMid, fontWeight:600 }}>{catLabel}</span>
              <span style={{ fontFamily:DS.mono, fontWeight:800, fontSize:22, color:DS.teal }}>EUR {parseFloat(importo).toFixed(2)}</span>
            </div>
            {commessaCodice && <div style={{ fontSize:11, color:DS.textLight }}>Commessa: {commessaCodice}</div>}
            {nota && <div style={{ fontSize:12, color:DS.textMid, marginTop:4 }}>{nota}</div>}
            {fotoB64 && <div style={{ fontSize:11, color:DS.green, marginTop:4 }}>Foto scontrino allegata</div>}
            {vocale && <div style={{ fontSize:11, color:DS.green, marginTop:2 }}>Nota vocale allegata</div>}
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setStep('dati')} style={{
              flex:1, padding:12, background:DS.tealLight, color:DS.textMid, border:'none',
              borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:DS.ui
            }}>Modifica</button>
            <button onClick={invia} style={{
              flex:2, padding:12, background:DS.green, color:'#fff', border:'none',
              borderRadius:10, fontWeight:700, cursor:'pointer', fontFamily:DS.ui, fontSize:14,
              boxShadow:`0 4px 0 0 ${DS.greenDark}`
            }}>Invia spesa</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP DONE ─────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:30, textAlign:'center', maxWidth:300 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <div style={{ fontWeight:800, fontSize:16, color:DS.text, marginTop:12 }}>Spesa inviata</div>
        <div style={{ fontSize:12, color:DS.textMid, marginTop:4 }}>In attesa di approvazione</div>
      </div>
    </div>
  );
}

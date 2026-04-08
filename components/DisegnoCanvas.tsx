// DisegnoCanvas.tsx — Disegno al volo dal cantiere
// Touch canvas per schizzare pezzi speciali con misure annotate
'use client';
// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';

const DS = {
  bg:'#E8F4F4', topbar:'#0D1F1F', teal:'#28A0A0', tealDark:'#156060',
  tealLight:'#EEF8F8', green:'#1A9E73', greenDark:'#0F7A56',
  red:'#DC4444', redDark:'#A83030', amber:'#D08008',
  text:'#0D1F1F', textMid:'#4A7070', textLight:'#8BBCBC',
  border:'#C8E4E4', mono:'"JetBrains Mono", monospace',
  ui:'system-ui, -apple-system, sans-serif',
};

const COLORS = ['#0D1F1F','#DC4444','#28A0A0','#1A9E73','#D08008'];
const SIZES = [2, 4, 8];
const TOOLS = [
  { id:'pen', label:'Penna' },
  { id:'line', label:'Linea' },
  { id:'rect', label:'Rettangolo' },
  { id:'text', label:'Misura' },
  { id:'eraser', label:'Gomma' },
];

interface DisegnoCanvasProps {
  onClose: () => void;
  onSend: (data: { imageData: string; nota: string; urgenza: string }) => void;
  commessaCodice?: string;
  vanoNome?: string;
}

export default function DisegnoCanvas({ onClose, onSend, commessaCodice, vanoNome }: DisegnoCanvasProps) {
  const canvasRef = useRef<any>(null);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0D1F1F');
  const [size, setSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [nota, setNota] = useState('');
  const [urgenza, setUrgenza] = useState('normale');
  const [showSend, setShowSend] = useState(false);
  const [misuraText, setMisuraText] = useState('');
  const [misuraPos, setMisuraPos] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const lastPos = useRef<any>(null);
  const shapeStart = useRef<any>(null);
  const snapshot = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    // Griglia leggera
    ctx.strokeStyle = '#E8F4F4';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.offsetWidth; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.offsetHeight); ctx.stroke();
    }
    for (let y = 0; y < canvas.offsetHeight; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.offsetWidth, y); ctx.stroke();
    }
    saveSnapshot();
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const restoreSnapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && snapshot.current) ctx.putImageData(snapshot.current, 0, 0);
  };

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) setHistory(h => [...h, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  };

  const onStart = (e: any) => {
    e.preventDefault();
    const pos = getPos(e);
    if (tool === 'text') {
      setMisuraPos(pos);
      setMisuraText('');
      return;
    }
    setDrawing(true);
    lastPos.current = pos;
    shapeStart.current = pos;
    saveHistory();
    saveSnapshot();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'eraser') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = size * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMove = (e: any) => {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'line' || tool === 'rect') {
      restoreSnapshot();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(shapeStart.current.x, shapeStart.current.y);
        ctx.lineTo(pos.x, pos.y);
        // Mostra misura sulla linea
        const dx = pos.x - shapeStart.current.x;
        const dy = pos.y - shapeStart.current.y;
        const dist = Math.round(Math.sqrt(dx*dx + dy*dy));
        ctx.font = '11px JetBrains Mono';
        ctx.fillStyle = color;
        ctx.fillText(`${dist}px`, (shapeStart.current.x+pos.x)/2+5, (shapeStart.current.y+pos.y)/2-5);
      } else {
        ctx.rect(shapeStart.current.x, shapeStart.current.y, pos.x-shapeStart.current.x, pos.y-shapeStart.current.y);
        const w = Math.abs(pos.x-shapeStart.current.x);
        const h = Math.abs(pos.y-shapeStart.current.y);
        ctx.font = '11px JetBrains Mono';
        ctx.fillStyle = color;
        ctx.fillText(`${Math.round(w)}x${Math.round(h)}`, Math.min(shapeStart.current.x,pos.x)+3, Math.min(shapeStart.current.y,pos.y)-3);
      }
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const onEnd = () => { setDrawing(false); saveSnapshot(); };

  const addMisura = () => {
    if (!misuraPos || !misuraText) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    saveHistory();
    ctx.font = 'bold 13px JetBrains Mono';
    ctx.fillStyle = DS.red;
    ctx.fillText(misuraText + ' mm', misuraPos.x, misuraPos.y);
    // Frecce
    ctx.strokeStyle = DS.red;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(misuraPos.x - 4, misuraPos.y + 2);
    ctx.lineTo(misuraPos.x + ctx.measureText(misuraText + ' mm').width + 4, misuraPos.y + 2);
    ctx.stroke();
    setMisuraPos(null);
    setMisuraText('');
    saveSnapshot();
  };

  const invia = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    onSend({ imageData, nota, urgenza });
  };

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ position:'fixed', inset:0, background:DS.topbar, zIndex:500, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', flexShrink:0 }}>
        <button onClick={onClose} style={{ background:'none', border:'none', color:DS.teal, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:DS.ui, display:'flex', alignItems:'center', gap:4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Chiudi
        </button>
        <div style={{ color:'#fff', fontWeight:700, fontSize:14, fontFamily:DS.ui }}>
          {vanoNome || 'Disegno'}
        </div>
        <button onClick={() => setShowSend(true)} style={{ background:DS.green, color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontWeight:700, fontSize:12, cursor:'pointer', boxShadow:`0 3px 0 0 ${DS.greenDark}`, fontFamily:DS.ui }}>
          Invia
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex:1, position:'relative', background:'#fff' }}>
        <canvas ref={canvasRef}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd}
          style={{ width:'100%', height:'100%', touchAction:'none', cursor: tool === 'text' ? 'crosshair' : 'default' }}/>
        {misuraPos && (
          <div style={{ position:'absolute', left:misuraPos.x, top:misuraPos.y+10, display:'flex', gap:4, zIndex:10 }}>
            <input value={misuraText} onChange={e => setMisuraText(e.target.value)} placeholder="es. 450"
              autoFocus type="number" inputMode="numeric"
              style={{ width:80, padding:'4px 8px', border:`2px solid ${DS.red}`, borderRadius:6, fontSize:13, fontFamily:DS.mono, outline:'none' }}/>
            <button onClick={addMisura} style={{ background:DS.red, color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:700, fontSize:12, cursor:'pointer' }}>mm</button>
            <button onClick={() => setMisuraPos(null)} style={{ background:'#eee', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize:12 }}>x</button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ background:DS.topbar, padding:'8px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:4, marginBottom:6, overflowX:'auto' }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} style={{
              padding:'6px 12px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:DS.ui,
              background: tool === t.id ? DS.teal : 'rgba(40,160,160,0.15)', color: tool === t.id ? '#fff' : DS.teal,
              flexShrink:0
            }}>{t.label}</button>
          ))}
          <button onClick={undo} style={{ padding:'6px 12px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:DS.ui, background:'rgba(220,68,68,0.15)', color:DS.red, flexShrink:0, marginLeft:'auto' }}>
            Annulla
          </button>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width:24, height:24, borderRadius:'50%', background:c, border: color === c ? '2.5px solid #fff' : '2px solid rgba(255,255,255,0.2)',
              cursor:'pointer', flexShrink:0
            }}/>
          ))}
          <div style={{ width:1, height:20, background:'rgba(255,255,255,0.15)', margin:'0 4px' }}/>
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)} style={{
              width:28, height:28, borderRadius:6, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              background: size === s ? 'rgba(40,160,160,0.3)' : 'transparent'
            }}>
              <div style={{ width:s*2, height:s*2, borderRadius:'50%', background:'#fff' }}/>
            </button>
          ))}
        </div>
      </div>

      {/* Modal invio */}
      {showSend && (
        <div onClick={() => setShowSend(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:510, display:'flex', alignItems:'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:480, margin:'0 auto' }}>
            <div style={{ width:40, height:4, borderRadius:2, background:DS.border, margin:'0 auto 16px' }}/>
            <div style={{ fontWeight:800, fontSize:16, color:DS.text, marginBottom:12 }}>Invia disegno</div>
            {commessaCodice && <div style={{ fontSize:11, color:DS.textLight, marginBottom:8 }}>Commessa: {commessaCodice}</div>}
            <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Descrivi cosa serve (es. lamiera sagomata 450x200mm, acciaio 2mm)" rows={3}
              style={{ width:'100%', padding:10, border:`1.5px solid ${DS.border}`, borderRadius:10, fontSize:13, outline:'none', resize:'none', boxSizing:'border-box', fontFamily:DS.ui, marginBottom:10 }}/>
            <div style={{ fontSize:11, color:DS.textLight, fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>Urgenza</div>
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {[{id:'normale',label:'Normale',bg:DS.tealLight,c:DS.teal},{id:'urgente',label:'Urgente',bg:'rgba(208,128,8,0.1)',c:DS.amber},{id:'bloccante',label:'Bloccante',bg:'rgba(220,68,68,0.1)',c:DS.red}].map(u => (
                <button key={u.id} onClick={() => setUrgenza(u.id)} style={{
                  flex:1, padding:'10px', borderRadius:10, border:`1.5px solid ${urgenza === u.id ? u.c : DS.border}`,
                  background: urgenza === u.id ? u.bg : '#fff', color: urgenza === u.id ? u.c : DS.textMid,
                  fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:DS.ui
                }}>{u.label}</button>
              ))}
            </div>
            <button onClick={invia} style={{
              width:'100%', padding:14, background:DS.green, color:'#fff', border:'none', borderRadius:12,
              fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:DS.ui, boxShadow:`0 4px 0 0 ${DS.greenDark}`
            }}>Invia all'ufficio</button>
          </div>
        </div>
      )}
    </div>
  );
}

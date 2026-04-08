// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';

const DS = {
  teal:'#28A0A0', tealDark:'#1a7a7a', tealLight:'rgba(40,160,160,0.08)',
  topbar:'#0D1F1F', text:'#1a2a2a', textMid:'#5a7a7a', textLight:'#8aA0A0',
  border:'#C8E4E4', green:'#1A9E73', greenDark:'#14805c',
  red:'#DC4444', white:'#FFFFFF', ui:'Inter, system-ui, sans-serif',
};

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODcyMDAsImV4cCI6MjA1ODY2MzIwMH0.4lKTGaxOWxGUyJLDOWVOxPbGMSFJkGzwMVtC8MhJMI8';

interface FirmaClienteProps {
  commessaId: string;
  commessaCodice: string;
  clienteNome: string;
  operatoreNome: string;
  vaniCompletati: number;
  vaniTotali: number;
  onFirmaSalvata?: (url: string) => void;
  onClose: () => void;
}

// SVG Icons
const PenSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
);
const UndoSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </svg>
);
const CheckSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function FirmaCliente({
  commessaId, commessaCodice, clienteNome, operatoreNome,
  vaniCompletati, vaniTotali, onFirmaSalvata, onClose,
}: FirmaClienteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string|null>(null);
  const lastPoint = useRef<{x:number;y:number}|null>(null);
  const sbHeaders = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` };

  // Init canvas
  useEffect(() => {
    initCanvas();
    // Prevent scroll on touch
    const prevent = (e: TouchEvent) => {
      if (canvasRef.current && canvasRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  function initCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 220;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // White background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Signature line
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(24, h - 50);
    ctx.lineTo(w - 24, h - 50);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hint text
    ctx.fillStyle = '#bbb';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Firma del cliente', w / 2, h - 28);
  }

  function clearCanvas() {
    setHasSignature(false);
    initCanvas();
  }

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    setIsDrawing(true);
    setHasSignature(true);
    lastPoint.current = pos;
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    if (!pos || !lastPoint.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a2a2a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  async function salvaFirma() {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const ts = Date.now();
      const path = `firme/${commessaId}/firma_${ts}.png`;
      const upRes = await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Content-Type': 'image/png' },
        body: blob,
      });

      if (!upRes.ok) {
        alert('Errore upload firma');
        setSaving(false);
        return;
      }

      const publicUrl = `${SB_URL}/storage/v1/object/public/foto-vani/${path}`;

      const record = {
        commessa_id: commessaId,
        firma_url: publicUrl,
        firmato_da: clienteNome,
        firmato_il: new Date().toISOString(),
        operatore: operatoreNome,
        vani_completati: vaniCompletati,
        vani_totali: vaniTotali,
        note: `Collaudo ${commessaCodice} - ${vaniCompletati}/${vaniTotali} vani`,
      };

      const insRes = await fetch(`${SB_URL}/rest/v1/firma_collaudo`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(record),
      });

      if (insRes.ok) {
        setSaved(true);
        setSavedUrl(publicUrl);
        onFirmaSalvata?.(publicUrl);
      } else {
        console.error('Insert firma error:', await insRes.text());
        alert('Errore salvataggio firma nel DB');
      }
    } catch (err) {
      console.error('salvaFirma:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  }

  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  // === FULLSCREEN ===
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, bottom:0,
      background:'#f4f8f8', zIndex:9998,
      display:'flex', flexDirection:'column', fontFamily:DS.ui,
    }}>
      {/* Topbar */}
      <div style={{
        background:DS.topbar, padding:'12px 16px', paddingTop:52,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{color:'#fff',fontWeight:700,fontSize:16}}>Firma Collaudo</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:12}}>{commessaCodice} - {clienteNome}</div>
        </div>
        <button onClick={onClose} style={{
          background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%',
          width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', color:'#fff',
        }}>
          <XSvg />
        </button>
      </div>

      {/* Content */}
      <div style={{flex:1, overflow:'auto', padding:16}}>
        {/* Riepilogo */}
        <div style={{
          background:DS.white, border:`1.5px solid ${DS.border}`, borderRadius:14,
          padding:16, marginBottom:16,
        }}>
          <div style={{fontSize:13,fontWeight:700,color:DS.text,marginBottom:10}}>Riepilogo Lavoro</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Cliente</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{clienteNome}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Commessa</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{commessaCodice}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Vani completati</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.green}}>{vaniCompletati}/{vaniTotali}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Operatore</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{operatoreNome}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Data</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{oggi}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:DS.textMid,textTransform:'uppercase',letterSpacing:0.5}}>Ora</div>
              <div style={{fontSize:14,fontWeight:700,color:DS.text}}>{ora}</div>
            </div>
          </div>
        </div>

        {/* Dichiarazione */}
        <div style={{
          background:'rgba(40,160,160,0.06)', border:`1.5px solid ${DS.teal}`,
          borderRadius:14, padding:14, marginBottom:16, fontSize:12, color:DS.text, lineHeight:1.6,
        }}>
          <div style={{fontWeight:700,marginBottom:6,fontSize:13}}>Dichiarazione di collaudo</div>
          Il/La sottoscritto/a <strong>{clienteNome}</strong> dichiara di aver verificato
          la corretta installazione dei serramenti ({vaniCompletati} vani su {vaniTotali} previsti)
          relativi alla commessa <strong>{commessaCodice}</strong>, e di accettare il lavoro
          eseguito dall'operatore <strong>{operatoreNome}</strong> in data <strong>{oggi}</strong>.
        </div>

        {/* Canvas firma */}
        {saved ? (
          <div style={{
            background:DS.white, border:`2px solid ${DS.green}`, borderRadius:14,
            padding:20, textAlign:'center',
          }}>
            <div style={{
              width:56, height:56, borderRadius:'50%', background:'rgba(26,158,115,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 12px', color:DS.green,
            }}>
              <CheckSvg />
            </div>
            <div style={{fontWeight:700,fontSize:16,color:DS.green,marginBottom:4}}>Firma salvata</div>
            <div style={{fontSize:12,color:DS.textMid,marginBottom:16}}>{oggi} alle {ora}</div>
            {savedUrl && (
              <div style={{borderRadius:10,overflow:'hidden',border:`1px solid ${DS.border}`}}>
                <img src={savedUrl} alt="firma" style={{width:'100%',display:'block'}}/>
              </div>
            )}
          </div>
        ) : (
          <div ref={containerRef} style={{
            background:DS.white, border:`1.5px solid ${DS.border}`, borderRadius:14,
            overflow:'hidden',
          }}>
            <div style={{
              padding:'10px 14px', borderBottom:`1px solid ${DS.border}`,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:6,color:DS.text}}>
                <PenSvg />
                <span style={{fontWeight:700,fontSize:13}}>Area firma</span>
              </div>
              <button onClick={clearCanvas} style={{
                background:'rgba(220,68,68,0.08)', border:`1px solid rgba(220,68,68,0.2)`,
                borderRadius:8, padding:'6px 10px', cursor:'pointer',
                display:'flex', alignItems:'center', gap:4,
                color:DS.red, fontFamily:DS.ui, fontWeight:600, fontSize:11,
              }}>
                <UndoSvg /> Cancella
              </button>
            </div>

            <canvas
              ref={canvasRef}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              style={{
                display:'block', width:'100%', height:220,
                touchAction:'none', cursor:'crosshair',
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {!saved && (
        <div style={{
          padding:'12px 16px', paddingBottom:28,
          background:DS.white, borderTop:`1px solid ${DS.border}`,
          display:'flex', gap:10,
        }}>
          <button onClick={onClose} style={{
            flex:1, padding:'14px 10px',
            background:'#fff', border:`1.5px solid ${DS.border}`, borderRadius:12,
            fontFamily:DS.ui, fontWeight:700, fontSize:14, color:DS.textMid,
            cursor:'pointer',
          }}>
            Annulla
          </button>
          <button
            onClick={salvaFirma}
            disabled={!hasSignature || saving}
            style={{
              flex:2, padding:'14px 10px',
              background: (!hasSignature || saving) ? DS.textLight : DS.green,
              color:'#fff', border:'none', borderRadius:12,
              fontFamily:DS.ui, fontWeight:700, fontSize:14,
              cursor: (!hasSignature || saving) ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow: (!hasSignature || saving) ? 'none' : `0 4px 0 0 ${DS.greenDark}`,
            }}
          >
            {saving ? 'Salvataggio...' : (
              <><CheckSvg /> Conferma e Salva</>
            )}
          </button>
        </div>
      )}

      {saved && (
        <div style={{
          padding:'12px 16px', paddingBottom:28,
          background:DS.white, borderTop:`1px solid ${DS.border}`,
        }}>
          <button onClick={onClose} style={{
            width:'100%', padding:'14px 10px',
            background:DS.teal, color:'#fff', border:'none', borderRadius:12,
            fontFamily:DS.ui, fontWeight:700, fontSize:14, cursor:'pointer',
            boxShadow:`0 4px 0 0 ${DS.tealDark}`,
          }}>
            Chiudi
          </button>
        </div>
      )}
    </div>
  );
}

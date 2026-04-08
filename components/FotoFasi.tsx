// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';

// ====== DESIGN SYSTEM ======
const DS = {
  teal: '#28A0A0', tealDark: '#1a7a7a', tealLight: 'rgba(40,160,160,0.08)',
  topbar: '#0D1F1F', text: '#1a2a2a', textMid: '#5a7a7a', textLight: '#8aA0A0',
  border: '#C8E4E4', green: '#1A9E73', greenDark: '#14805c',
  red: '#DC4444', redDark: '#b33636', amber: '#F59E0B', amberDark: '#d48806',
  white: '#FFFFFF', ui: 'Inter, system-ui, sans-serif',
};

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODcyMDAsImV4cCI6MjA1ODY2MzIwMH0.4lKTGaxOWxGUyJLDOWVOxPbGMSFJkGzwMVtC8MhJMI8';
const BUCKET = 'foto-vani';

type Fase = 'prima' | 'durante' | 'dopo';

interface FotoItem {
  id: string;
  url: string;
  fase: Fase;
  created_at: string;
  note?: string;
}

interface FotoFasiProps {
  vanoId: string;
  vanoNome: string;
  commessaId: string;
  montaggioId?: string;
  operatoreId?: string;
  compact?: boolean;
}

const FASI: { key: Fase; label: string; icon: string; color: string; desc: string }[] = [
  { key: 'prima', label: 'PRIMA', icon: '\u{1F4F7}', color: DS.amber, desc: 'Stato iniziale del vano' },
  { key: 'durante', label: 'DURANTE', icon: '\u{1F527}', color: DS.teal, desc: 'Lavori in corso' },
  { key: 'dopo', label: 'DOPO', icon: '\u2705', color: DS.green, desc: 'Lavoro completato' },
];

// SVG icons inline (no emoji in rendered UI)
const CameraSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const CheckSvg = ({color}:{color:string}) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FotoFasi({ vanoId, vanoNome, commessaId, montaggioId, operatoreId, compact }: FotoFasiProps) {
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const [selectedFase, setSelectedFase] = useState<Fase>('prima');
  const [preview, setPreview] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch existing photos for this vano
  useEffect(() => {
    loadFotos();
  }, [vanoId]);

  const sbHeaders = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` };

  async function loadFotos() {
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/allegati_vano?vano_id=eq.${vanoId}&fase=not.is.null&select=id,file_url,fase,created_at,note&order=created_at.asc`,
        { headers: { ...sbHeaders, 'Content-Type': 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        setFotos(data.map((d: any) => ({ id: d.id, url: d.file_url, fase: d.fase, created_at: d.created_at, note: d.note })));
      }
    } catch (e) { console.error('loadFotos error:', e); }
  }

  // Determine current active fase
  const fotoPerFase = (f: Fase) => fotos.filter(p => p.fase === f);
  const faseCompletata = (f: Fase) => fotoPerFase(f).length > 0;
  const tutteComplete = FASI.every(f => faseCompletata(f.key));
  const fasiCompletate = FASI.filter(f => faseCompletata(f.key)).length;

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Storage
      const ts = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${commessaId}/${vanoId}/${selectedFase}_${ts}.${ext}`;

      const uploadRes = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error('Upload failed:', errText);
        alert('Errore upload foto');
        return;
      }

      // 2. Get public URL
      const publicUrl = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;

      // 3. Get GPS if available
      let lat: number | null = null;
      let lng: number | null = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch { /* GPS non disponibile, va bene */ }

      // 4. Insert record in allegati_vano
      const record: any = {
        vano_id: vanoId,
        commessa_id: commessaId,
        tipo: 'foto',
        categoria: 'montaggio',
        fase: selectedFase,
        nome: `Foto ${selectedFase} - ${vanoNome}`,
        file_url: publicUrl,
        file_path: path,
        file_size: file.size,
        note: noteText || null,
      };
      if (operatoreId) record.operatore_id = operatoreId;
      if (montaggioId) record.montaggio_id = montaggioId;
      if (lat !== null) record.latitudine = lat;
      if (lng !== null) record.longitudine = lng;

      const insertRes = await fetch(`${SB_URL}/rest/v1/allegati_vano`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(record),
      });

      if (insertRes.ok) {
        const [inserted] = await insertRes.json();
        setFotos(prev => [...prev, { id: inserted.id, url: publicUrl, fase: selectedFase, created_at: new Date().toISOString(), note: noteText || undefined }]);
        setNoteText('');

        // Auto-advance to next incomplete fase
        const nextFase = FASI.find(f => f.key !== selectedFase && !faseCompletata(f.key));
        if (nextFase) setSelectedFase(nextFase.key);
      } else {
        console.error('Insert failed:', await insertRes.text());
        alert('Foto salvata ma errore registrazione DB');
      }
    } catch (err) {
      console.error('Capture error:', err);
      alert('Errore durante il salvataggio');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function deleteFoto(foto: FotoItem) {
    if (!confirm('Eliminare questa foto?')) return;
    try {
      // Delete from DB
      await fetch(`${SB_URL}/rest/v1/allegati_vano?id=eq.${foto.id}`, {
        method: 'DELETE', headers: sbHeaders,
      });
      setFotos(prev => prev.filter(f => f.id !== foto.id));
    } catch (e) { console.error('Delete error:', e); }
  }

  // === BADGE COMPATTO (per lista vani) ===
  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: tutteComplete ? 'rgba(26,158,115,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1.5px solid ${tutteComplete ? DS.green : DS.amber}`,
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          fontFamily: DS.ui, fontSize: 12, fontWeight: 700,
          color: tutteComplete ? DS.green : DS.amber,
        }}
      >
        <Camera size={14} />
        Foto {fasiCompletate}/3
        {tutteComplete && <CheckSvg color={DS.green} />}
      </button>
    );
  }

  // === VISTA COMPLETA ===
  return (
    <div style={{
      background: DS.white, border: `1.5px solid ${DS.border}`, borderRadius: 14,
      overflow: 'hidden', marginBottom: 12,
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: tutteComplete ? 'rgba(26,158,115,0.06)' : DS.tealLight,
          border: 'none', cursor: 'pointer', fontFamily: DS.ui,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Camera size={18} color={tutteComplete ? DS.green : DS.teal} />
          <span style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>Foto Montaggio</span>
          <span style={{
            background: tutteComplete ? DS.green : DS.amber,
            color: '#fff', borderRadius: 10, padding: '2px 8px',
            fontSize: 11, fontWeight: 700,
          }}>
            {fasiCompletate}/3
          </span>
        </div>
        {expanded ? <ChevronUp size={18} color={DS.textMid} /> : <ChevronDown size={18} color={DS.textMid} />}
      </button>

      {expanded && (
        <div style={{ padding: 14 }}>
          {/* Fase selector - 3 bottoni */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {FASI.map(f => {
              const done = faseCompletata(f.key);
              const active = selectedFase === f.key;
              const count = fotoPerFase(f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setSelectedFase(f.key)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                    border: active ? `2.5px solid ${f.color}` : `1.5px solid ${done ? f.color : DS.border}`,
                    background: active ? `${f.color}10` : done ? `${f.color}08` : '#fff',
                    fontFamily: DS.ui, transition: 'all 200ms',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {done ? (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: f.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckSvg color="#fff" />
                      </div>
                    ) : (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        border: `2px dashed ${active ? f.color : DS.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: active ? f.color : DS.textLight, fontSize: 12, fontWeight: 700,
                      }}>
                        {count}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                    color: active ? f.color : done ? f.color : DS.textMid,
                  }}>
                    {f.label}
                  </span>
                  {count > 0 && (
                    <span style={{ fontSize: 9, color: DS.textMid }}>{count} foto</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Foto grid per fase selezionata */}
          {fotoPerFase(selectedFase).length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
              marginBottom: 12,
            }}>
              {fotoPerFase(selectedFase).map(foto => (
                <div key={foto.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                  <img
                    src={foto.url}
                    alt={`${selectedFase}`}
                    onClick={() => setPreview(foto.url)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFoto(foto); }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(220,68,68,0.85)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} color="#fff" />
                  </button>
                  {foto.note && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      padding: '3px 6px', fontSize: 9, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {foto.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Area cattura foto */}
          <div style={{
            border: `2px dashed ${FASI.find(f => f.key === selectedFase)?.color || DS.teal}`,
            borderRadius: 12, padding: 16, textAlign: 'center',
            background: `${FASI.find(f => f.key === selectedFase)?.color || DS.teal}06`,
          }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              style={{ display: 'none' }}
            />

            {/* Nota opzionale */}
            <input
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder={`Nota foto ${selectedFase} (opzionale)`}
              style={{
                width: '100%', padding: '8px 10px', border: `1.5px solid ${DS.border}`,
                borderRadius: 8, fontSize: 12, fontFamily: DS.ui, outline: 'none',
                marginBottom: 10, boxSizing: 'border-box' as const,
                background: '#fff',
              }}
            />

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                width: '100%', padding: '14px 16px',
                background: uploading ? DS.textLight : (FASI.find(f => f.key === selectedFase)?.color || DS.teal),
                color: '#fff', border: 'none', borderRadius: 12, cursor: uploading ? 'wait' : 'pointer',
                fontFamily: DS.ui, fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: uploading ? 'none' : `0 4px 0 0 ${FASI.find(f => f.key === selectedFase)?.color === DS.amber ? DS.amberDark : FASI.find(f => f.key === selectedFase)?.color === DS.green ? DS.greenDark : DS.tealDark}`,
              }}
            >
              {uploading ? (
                <>
                  <Upload size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Caricamento...
                </>
              ) : (
                <>
                  <CameraSvg />
                  Scatta foto {selectedFase.toUpperCase()}
                </>
              )}
            </button>

            <div style={{ fontSize: 11, color: DS.textMid, marginTop: 8 }}>
              {FASI.find(f => f.key === selectedFase)?.desc}
            </div>
          </div>

          {/* Status complessivo */}
          {tutteComplete && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(26,158,115,0.08)',
              border: `1.5px solid ${DS.green}`, borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle size={18} color={DS.green} />
              <span style={{ fontSize: 13, fontWeight: 700, color: DS.green }}>
                Documentazione foto completa
              </span>
            </div>
          )}

          {!tutteComplete && fasiCompletate > 0 && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,0.08)',
              border: `1.5px solid ${DS.amber}`, borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={18} color={DS.amber} />
              <span style={{ fontSize: 12, color: DS.amber, fontWeight: 600 }}>
                Mancano foto: {FASI.filter(f => !faseCompletata(f.key)).map(f => f.label).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preview fullscreen */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={24} color="#fff" />
          </button>
          <img src={preview} alt="preview" style={{ maxWidth: '95%', maxHeight: '90vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

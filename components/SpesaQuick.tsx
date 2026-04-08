// @ts-nocheck
'use client';
import React, { useState, useRef, useEffect } from 'react';

const DS = {
  teal:'#28A0A0', tealDark:'#1a7a7a', tealLight:'rgba(40,160,160,0.08)',
  topbar:'#0D1F1F', text:'#1a2a2a', textMid:'#5a7a7a', textLight:'#8aA0A0',
  border:'#C8E4E4', green:'#1A9E73', greenDark:'#14805c',
  red:'#DC4444', amber:'#F59E0B', amberDark:'#d48806',
  white:'#FFFFFF', ui:'Inter, system-ui, sans-serif', mono:'"JetBrains Mono", monospace',
};

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODcyMDAsImV4cCI6MjA1ODY2MzIwMH0.4lKTGaxOWxGUyJLDOWVOxPbGMSFJkGzwMVtC8MhJMI8';

const CATEGORIE = [
  { id: 'carburante', label: 'Carburante', icon: 'G', color: '#3B7FE0' },
  { id: 'materiale', label: 'Materiale', icon: 'M', color: DS.amber },
  { id: 'pranzo', label: 'Pranzo', icon: 'P', color: DS.green },
  { id: 'autostrada', label: 'Autostrada', icon: 'A', color: '#8B5CF6' },
  { id: 'parcheggio', label: 'Parcheggio', icon: 'K', color: '#EC4899' },
  { id: 'ferramenta', label: 'Ferramenta', icon: 'F', color: DS.teal },
  { id: 'altro', label: 'Altro', icon: '?', color: DS.textMid },
];

interface SpesaQuickProps {
  operatoreNome: string;
  operatoreId?: string;
  aziendaId?: string;
  commessaId?: string;
  commessaCodice?: string;
  onClose: () => void;
}

interface SpesaRecord {
  id: string;
  importo: number;
  categoria: string;
  nota: string;
  foto_url: string | null;
  cm_id: string | null;
  stato: string;
  created_at: string;
}

export default function SpesaQuick({ operatoreNome, operatoreId, aziendaId, commessaId, commessaCodice, onClose }: SpesaQuickProps) {
  const [step, setStep] = useState<'form' | 'lista' | 'success'>('form');
  const [importo, setImporto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nota, setNota] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [spese, setSpese] = useState<SpesaRecord[]>([]);
  const [loadingSpese, setLoadingSpese] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const sbH = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

  useEffect(() => { loadSpese(); }, []);

  async function loadSpese() {
    try {
      const filter = operatoreId ? `operatore_id=eq.${operatoreId}` : `operatore_nome=eq.${encodeURIComponent(operatoreNome)}`;
      const res = await fetch(
        `${SB_URL}/rest/v1/spese_operatori?${filter}&select=*&order=created_at.desc&limit=20`,
        { headers: sbH }
      );
      if (res.ok) setSpese(await res.json());
    } catch (e) { console.error('loadSpese:', e); }
    setLoadingSpese(false);
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `spese/${operatoreNome.replace(/\s/g, '_')}/${ts}.${ext}`;
      const upRes = await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`, {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': file.type },
        body: file,
      });
      if (upRes.ok) {
        setFotoUrl(`${SB_URL}/storage/v1/object/public/foto-vani/${path}`);
      } else {
        alert('Errore upload foto');
      }
    } catch (e) { console.error('handleFoto:', e); alert('Errore upload'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function salvaSpesa() {
    if (!importo || !categoria) return;
    setSaving(true);
    try {
      const record = {
        operatore_nome: operatoreNome,
        operatore_id: operatoreId || null,
        azienda_id: aziendaId || null,
        importo: parseFloat(importo),
        categoria,
        nota: nota || null,
        foto_url: fotoUrl,
        cm_id: commessaId || null,
        stato: 'da_approvare',
      };
      const res = await fetch(`${SB_URL}/rest/v1/spese_operatori`, {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=representation' },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        setStep('success');
        setTimeout(() => {
          setStep('form');
          setImporto('');
          setCategoria('');
          setNota('');
          setFotoUrl(null);
          loadSpese();
        }, 2000);
      } else {
        alert('Errore salvataggio spesa');
      }
    } catch (e) { console.error('salvaSpesa:', e); alert('Errore'); }
    setSaving(false);
  }

  const totMese = spese
    .filter(s => new Date(s.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, s) => sum + (Number(s.importo) || 0), 0);

  const catColor = (cat: string) => CATEGORIE.find(c => c.id === cat)?.color || DS.textMid;

  // === FULLSCREEN ===
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#f4f8f8', zIndex: 9998,
      display: 'flex', flexDirection: 'column', fontFamily: DS.ui,
    }}>
      {/* Topbar */}
      <div style={{
        background: DS.topbar, padding: '12px 16px', paddingTop: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Spese</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{operatoreNome}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep(step === 'lista' ? 'form' : 'lista')} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer', color: '#fff',
            fontFamily: DS.ui, fontWeight: 600, fontSize: 12,
          }}>
            {step === 'lista' ? 'Nuova' : 'Storico'}
          </button>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Totale mese */}
      <div style={{
        background: DS.white, padding: '10px 16px', borderBottom: `1px solid ${DS.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: DS.textMid }}>Totale questo mese</span>
        <span style={{ fontFamily: DS.mono, fontSize: 18, fontWeight: 700, color: DS.text }}>
          {'\u20AC'}{totMese.toFixed(2)}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(26,158,115,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: DS.green }}>Spesa registrata</div>
            <div style={{ fontSize: 13, color: DS.textMid, marginTop: 4 }}>In attesa di approvazione</div>
          </div>
        )}

        {/* FORM */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Importo */}
            <div style={{
              background: DS.white, border: `1.5px solid ${DS.border}`, borderRadius: 14,
              padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: DS.textMid, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Importo</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: DS.textLight }}>{'\u20AC'}</span>
                <input
                  value={importo}
                  onChange={e => setImporto(e.target.value.replace(/[^0-9.,]/g, ''))}
                  placeholder="0.00"
                  inputMode="decimal"
                  autoFocus
                  style={{
                    fontSize: 36, fontWeight: 800, fontFamily: DS.mono,
                    border: 'none', outline: 'none', textAlign: 'center',
                    width: 160, color: DS.text, background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* Categoria */}
            <div style={{ background: DS.white, border: `1.5px solid ${DS.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 11, color: DS.textMid, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Categoria</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {CATEGORIE.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoria(cat.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                      border: categoria === cat.id ? `2.5px solid ${cat.color}` : `1.5px solid ${DS.border}`,
                      background: categoria === cat.id ? `${cat.color}15` : '#fff',
                      fontFamily: DS.ui,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: categoria === cat.id ? cat.color : `${cat.color}20`,
                      color: categoria === cat.id ? '#fff' : cat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 600, color: categoria === cat.id ? cat.color : DS.textMid }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nota + Foto */}
            <div style={{ background: DS.white, border: `1.5px solid ${DS.border}`, borderRadius: 14, padding: 14 }}>
              <input
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Nota (opzionale)"
                style={{
                  width: '100%', padding: '10px 12px', border: `1.5px solid ${DS.border}`,
                  borderRadius: 8, fontSize: 13, fontFamily: DS.ui, outline: 'none',
                  marginBottom: 10, boxSizing: 'border-box',
                }}
              />

              {commessaCodice && (
                <div style={{
                  fontSize: 11, color: DS.teal, fontWeight: 600,
                  background: DS.tealLight, borderRadius: 6, padding: '4px 8px',
                  marginBottom: 10, display: 'inline-block',
                }}>
                  Commessa: {commessaCodice}
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />

              {fotoUrl ? (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${DS.border}` }}>
                  <img src={fotoUrl} alt="scontrino" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => setFotoUrl(null)} style={{
                    position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(220,68,68,0.85)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                  width: '100%', padding: '12px', background: '#fff',
                  border: `2px dashed ${DS.border}`, borderRadius: 10, cursor: 'pointer',
                  fontFamily: DS.ui, fontSize: 13, fontWeight: 600, color: DS.textMid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.textMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
                  </svg>
                  {uploading ? 'Caricamento...' : 'Foto scontrino'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* LISTA SPESE */}
        {step === 'lista' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loadingSpese && <div style={{ textAlign: 'center', color: DS.textMid, padding: 20 }}>Caricamento...</div>}
            {!loadingSpese && spese.length === 0 && (
              <div style={{ textAlign: 'center', color: DS.textLight, padding: 40 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Nessuna spesa registrata</div>
              </div>
            )}
            {spese.map(s => (
              <div key={s.id} style={{
                background: DS.white, border: `1.5px solid ${DS.border}`, borderRadius: 12,
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${catColor(s.categoria)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: catColor(s.categoria),
                }}>
                  {CATEGORIE.find(c => c.id === s.categoria)?.icon || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>
                      {CATEGORIE.find(c => c.id === s.categoria)?.label || s.categoria}
                    </span>
                    <span style={{ fontFamily: DS.mono, fontWeight: 700, fontSize: 15, color: DS.text }}>
                      {'\u20AC'}{Number(s.importo).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: DS.textMid }}>
                      {s.nota || ''}{s.cm_id ? ` \u2022 ${s.cm_id}` : ''}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px',
                      background: s.stato === 'approvata' ? 'rgba(26,158,115,0.1)' : s.stato === 'rifiutata' ? 'rgba(220,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: s.stato === 'approvata' ? DS.green : s.stato === 'rifiutata' ? DS.red : DS.amber,
                    }}>
                      {s.stato === 'da_approvare' ? 'In attesa' : s.stato === 'approvata' ? 'Approvata' : 'Rifiutata'}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: DS.textLight, marginTop: 2 }}>
                    {new Date(s.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {s.foto_url && (
                  <img src={s.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar - solo nel form */}
      {step === 'form' && (
        <div style={{
          padding: '12px 16px', paddingBottom: 28,
          background: DS.white, borderTop: `1px solid ${DS.border}`,
        }}>
          <button
            onClick={salvaSpesa}
            disabled={!importo || !categoria || saving}
            style={{
              width: '100%', padding: '16px',
              background: (!importo || !categoria || saving) ? DS.textLight : DS.teal,
              color: '#fff', border: 'none', borderRadius: 14,
              fontFamily: DS.ui, fontWeight: 800, fontSize: 15,
              cursor: (!importo || !categoria || saving) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: (!importo || !categoria || saving) ? 'none' : `0 5px 0 0 ${DS.tealDark}`,
            }}
          >
            {saving ? 'Salvataggio...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                Registra spesa {importo ? `\u20AC${importo}` : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

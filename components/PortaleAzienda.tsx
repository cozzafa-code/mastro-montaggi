// @ts-nocheck
// PortaleAzienda.tsx — Pagina pubblica per aziende che inviano lavori al freelance
// URL: /azienda/[invite_code]
'use client';
import React, { useState, useEffect, useRef } from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';

async function sbGet(table: string, params: Record<string,string>) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${qs}`, {
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
  });
  return r.ok ? r.json() : [];
}

async function sbPost(table: string, body: object) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json', 'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  return r.ok ? r.json() : null;
}

async function sbUpload(path: string, file: File): Promise<string|null> {
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/foto-vani/${path}`, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': file.type, 'x-upsert': 'true' },
      body: file,
    });
    if (!r.ok) return null;
    return `${SB_URL}/storage/v1/object/public/foto-vani/${path}`;
  } catch { return null; }
}

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const DS = {
  bg: '#E8F4F4', topbar: '#0D1F1F', teal: '#28A0A0', tealDark: '#156060',
  card: '#fff', border: '#C8E4E4', text: '#0D1F1F', textMid: '#4A7070', textLight: '#8BBCBC',
  red: '#DC4444', green: '#1A9E73', amber: '#D08008',
};

const TIPI_VANO = ['Finestra','Portafinestra','Porta','Scorrevole','Velux','Persiana','Zanzariera','Cassonetto','Altro'];
const MATERIALI = ['PVC','Alluminio','Legno','Alluminio-Legno','Acciaio','Altro'];

interface Vano {
  id: number;
  tipo: string;
  materiale: string;
  larghezza: string;
  altezza: string;
  stanza: string;
  piano: string;
  note: string;
}

interface Allegato {
  nome: string;
  url: string;
  tipo: string;
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────
export default function PortaleAzienda({ inviteCode }: { inviteCode: string }) {
  const [loading, setLoading] = useState(true);
  const [azienda, setAzienda] = useState<any>(null);
  const [operatore, setOperatore] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [storico, setStorico] = useState<any[]>([]);
  const [showStorico, setShowStorico] = useState(false);

  // Form
  const [cliente, setCliente] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [telCliente, setTelCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [dataPreferita, setDataPreferita] = useState('');
  const [oraPreferita, setOraPreferita] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');
  const [vani, setVani] = useState<Vano[]>([
    { id: 1, tipo: 'Finestra', materiale: 'PVC', larghezza: '', altezza: '', stanza: '', piano: 'PT', note: '' }
  ]);
  const [allegati, setAllegati] = useState<Allegato[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load azienda dal codice invito
  useEffect(() => {
    (async () => {
      const res = await sbGet('aziende_freelance', { invite_code: 'eq.' + inviteCode, limit: '1' });
      if (!res || res.length === 0) { setNotFound(true); setLoading(false); return; }
      const az = res[0];
      setAzienda(az);
      // Load operatore (freelance)
      const opRes = await sbGet('operatori', { id: 'eq.' + az.operatore_id, limit: '1' });
      if (opRes?.[0]) setOperatore(opRes[0]);
      // Load storico richieste
      const stRes = await sbGet('richieste_lavoro', {
        azienda_fl_id: 'eq.' + az.id,
        order: 'created_at.desc', limit: '20',
      });
      setStorico(stRes || []);
      setLoading(false);
    })();
  }, [inviteCode]);

  // Aggiungi vano
  const addVano = () => setVani(v => [...v, {
    id: v.length + 1, tipo: 'Finestra', materiale: 'PVC',
    larghezza: '', altezza: '', stanza: '', piano: 'PT', note: ''
  }]);
  const removeVano = (id: number) => setVani(v => v.filter(x => x.id !== id));
  const updateVano = (id: number, field: string, val: string) =>
    setVani(v => v.map(x => x.id === id ? { ...x, [field]: val } : x));

  // Upload foto
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const path = `portale/${inviteCode}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const url = await sbUpload(path, f);
      if (url) {
        setAllegati(prev => [...prev, { nome: f.name, url, tipo: f.type.startsWith('image') ? 'img' : 'file' }]);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  // Invia richiesta
  const invia = async () => {
    if (!cliente.trim() || !indirizzo.trim()) return;
    setSending(true);
    const body = {
      azienda_fl_id: azienda.id,
      operatore_id: azienda.operatore_id,
      cliente: cliente.trim(),
      indirizzo: indirizzo.trim(),
      telefono_cliente: telCliente,
      email_cliente: emailCliente,
      data_preferita: dataPreferita || null,
      ora_preferita: oraPreferita || null,
      urgente,
      budget: budget ? parseFloat(budget) : null,
      note,
      vani_json: vani.map(v => ({
        tipo: v.tipo, materiale: v.materiale,
        larghezza: v.larghezza ? parseInt(v.larghezza) : null,
        altezza: v.altezza ? parseInt(v.altezza) : null,
        stanza: v.stanza, piano: v.piano, note: v.note,
      })),
      allegati_json: allegati,
      stato: 'nuova',
    };
    const res = await sbPost('richieste_lavoro', body);
    setSending(false);
    if (res) setSent(true);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: DS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${DS.border}`, borderTop: `3px solid ${DS.teal}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: DS.textMid, fontSize: 14 }}>Caricamento...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: DS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: DS.text, marginBottom: 8 }}>Link non valido</div>
        <div style={{ color: DS.textMid, fontSize: 14 }}>Questo link di invito non esiste o è stato disattivato. Contatta il tuo montatore per un nuovo link.</div>
      </div>
    </div>
  );

  if (sent) return (
    <div style={{ minHeight: '100vh', background: DS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: DS.text, marginBottom: 8 }}>Richiesta inviata!</div>
        <div style={{ color: DS.textMid, fontSize: 14, marginBottom: 24 }}>
          {operatore ? `${operatore.nome} ${operatore.cognome}` : 'Il montatore'} riceverà una notifica e ti contatterà a breve.
        </div>
        <button onClick={() => { setSent(false); setCliente(''); setIndirizzo(''); setTelCliente(''); setEmailCliente(''); setNote(''); setBudget(''); setVani([{ id: 1, tipo: 'Finestra', materiale: 'PVC', larghezza: '', altezza: '', stanza: '', piano: 'PT', note: '' }]); setAllegati([]); }}
          style={{ background: DS.teal, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Invia un altro lavoro
        </button>
      </div>
    </div>
  );

  const nomeFreelance = operatore ? `${operatore.nome} ${operatore.cognome}` : 'Montatore';

  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* TOPBAR */}
      <div style={{ background: DS.topbar, padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: azienda?.colore || DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
            {(azienda?.nome || '?')[0]}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{azienda?.nome}</div>
            <div style={{ color: DS.textLight, fontSize: 12 }}>Portale lavori per {nomeFreelance}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* STORICO */}
        {storico.length > 0 && (
          <button onClick={() => setShowStorico(!showStorico)}
            style={{ width: '100%', background: DS.card, border: `1.5px solid ${DS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>
              Storico richieste ({storico.length})
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: showStorico ? 'rotate(180deg)' : 'none', transition: '.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        {showStorico && storico.map((r: any) => (
          <div key={r.id} style={{ background: DS.card, border: `1.5px solid ${DS.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>{r.cliente}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px',
                background: r.stato === 'accettata' ? '#D1FAE5' : r.stato === 'rifiutata' ? '#FEE2E2' : r.stato === 'completata' ? '#DBEAFE' : '#FEF3C7',
                color: r.stato === 'accettata' ? '#065F46' : r.stato === 'rifiutata' ? '#991B1B' : r.stato === 'completata' ? '#1E40AF' : '#92400E',
              }}>
                {r.stato === 'nuova' ? 'In attesa' : r.stato === 'vista' ? 'Vista' : r.stato === 'accettata' ? 'Accettata' : r.stato === 'rifiutata' ? 'Rifiutata' : r.stato === 'completata' ? 'Completata' : r.stato}
              </span>
            </div>
            <div style={{ fontSize: 12, color: DS.textMid }}>{r.indirizzo}</div>
            <div style={{ fontSize: 11, color: DS.textLight, marginTop: 4 }}>
              {new Date(r.created_at).toLocaleDateString('it-IT')} — {(r.vani_json || []).length} vani
              {r.budget && ` — €${r.budget}`}
            </div>
          </div>
        ))}

        {/* TITOLO */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: DS.text, marginBottom: 4 }}>Nuovo lavoro</div>
          <div style={{ fontSize: 13, color: DS.textMid }}>Compila i dati e {nomeFreelance} riceverà la tua richiesta</div>
        </div>

        {/* FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Cliente + Indirizzo */}
          <Card title="Dati cliente">
            <Input label="Nome cliente *" value={cliente} onChange={setCliente} placeholder="Mario Rossi" />
            <Input label="Indirizzo cantiere *" value={indirizzo} onChange={setIndirizzo} placeholder="Via Roma 45, Cosenza" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input label="Telefono" value={telCliente} onChange={setTelCliente} placeholder="333 1234567" type="tel" />
              <Input label="Email" value={emailCliente} onChange={setEmailCliente} placeholder="mario@email.it" type="email" />
            </div>
          </Card>

          {/* Data e urgenza */}
          <Card title="Tempistiche">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input label="Data preferita" value={dataPreferita} onChange={setDataPreferita} type="date" />
              <Input label="Ora preferita" value={oraPreferita} onChange={setOraPreferita} type="time" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <button onClick={() => setUrgente(!urgente)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                  background: urgente ? DS.red : '#D1D5DB', transition: '.2s',
                }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2,
                  left: urgente ? 22 : 2, transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: urgente ? 700 : 400, color: urgente ? DS.red : DS.textMid }}>
                {urgente ? 'URGENTE' : 'Urgente'}
              </span>
            </div>
          </Card>

          {/* Vani */}
          <Card title={`Vani da installare (${vani.length})`}>
            {vani.map((v, i) => (
              <div key={v.id} style={{ background: '#F4FAFA', borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${DS.border}`, position: 'relative' }}>
                {vani.length > 1 && (
                  <button onClick={() => removeVano(v.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DS.red} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: DS.teal, marginBottom: 8 }}>Vano {i + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Select label="Tipo" value={v.tipo} onChange={(val) => updateVano(v.id, 'tipo', val)} options={TIPI_VANO} />
                  <Select label="Materiale" value={v.materiale} onChange={(val) => updateVano(v.id, 'materiale', val)} options={MATERIALI} />
                  <Input label="Larghezza mm" value={v.larghezza} onChange={(val) => updateVano(v.id, 'larghezza', val)} placeholder="1200" type="number" />
                  <Input label="Altezza mm" value={v.altezza} onChange={(val) => updateVano(v.id, 'altezza', val)} placeholder="1400" type="number" />
                  <Input label="Stanza" value={v.stanza} onChange={(val) => updateVano(v.id, 'stanza', val)} placeholder="Soggiorno" />
                  <Select label="Piano" value={v.piano} onChange={(val) => updateVano(v.id, 'piano', val)} options={['PT', '1', '2', '3', '4', '5', 'Interrato']} />
                </div>
                <Input label="Note" value={v.note} onChange={(val) => updateVano(v.id, 'note', val)} placeholder="Controtelaio presente, davanzale da rimuovere..." />
              </div>
            ))}
            <button onClick={addVano}
              style={{ width: '100%', border: `2px dashed ${DS.border}`, background: 'transparent', borderRadius: 10, padding: '10px 0', cursor: 'pointer', color: DS.teal, fontWeight: 700, fontSize: 13 }}>
              + Aggiungi vano
            </button>
          </Card>

          {/* Budget */}
          <Card title="Budget">
            <Input label="Budget indicativo (€)" value={budget} onChange={setBudget} placeholder="350" type="number" />
          </Card>

          {/* Allegati */}
          <Card title={`Foto e documenti (${allegati.length})`}>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{ display: 'none' }} onChange={handleUpload} />
            {allegati.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {allegati.map((a, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1px solid ${DS.border}` }}>
                    {a.tipo === 'img' ? (
                      <img src={a.url} alt={a.nome} style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4FAFA' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                    )}
                    <button onClick={() => setAllegati(prev => prev.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: '100%', border: `2px dashed ${DS.border}`, background: 'transparent', borderRadius: 10, padding: '14px 0', cursor: 'pointer', color: DS.teal, fontWeight: 700, fontSize: 13, opacity: uploading ? 0.5 : 1 }}>
              {uploading ? 'Caricamento...' : '+ Foto cantiere, planimetrie, documenti'}
            </button>
          </Card>

          {/* Note */}
          <Card title="Note aggiuntive">
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Descrivi il lavoro, accesso al cantiere, particolarità..."
              style={{ width: '100%', minHeight: 80, border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </Card>
        </div>

        {/* BOTTONE INVIA */}
        <button onClick={invia} disabled={!cliente.trim() || !indirizzo.trim() || sending}
          style={{
            position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: 568, margin: '0 auto',
            background: (!cliente.trim() || !indirizzo.trim()) ? '#9CA3AF' : DS.teal,
            color: '#fff', border: 'none', borderRadius: 14, padding: '16px 0',
            fontSize: 16, fontWeight: 800, cursor: 'pointer', zIndex: 100,
            boxShadow: '0 4px 20px rgba(40,160,160,.4)',
            opacity: sending ? 0.6 : 1,
          }}>
          {sending ? 'Invio in corso...' : `Invia richiesta a ${nomeFreelance}`}
        </button>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid #C8E4E4`, padding: '14px 16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1F1F', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#4A7070', marginBottom: 4 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'}
        style={{ width: '100%', border: '1.5px solid #C8E4E4', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#4A7070', marginBottom: 4 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: '1.5px solid #C8E4E4', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

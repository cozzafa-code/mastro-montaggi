// ts-20260406t — GalassiaAI.tsx
// AI interna che si nutre da catalogo_galassia in Supabase
// Risponde a domande tecniche su prodotti, applicazioni, normative
'use client';
import React from 'react';

const SB_URL = 'https://fgefcigxlbrmbeqqzjmo.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZWZjaWd4bGJybWJlcXF6am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODgwNDIsImV4cCI6MjA4NzI2NDA0Mn0.Pw_XaFZ1JMVsoNy5_LiozF2r3YZGuhUkqzRtUdPnjk8';

const DS = {
  bg: '#E8F4F4', topbar: '#0D1F1F', teal: '#28A0A0', tealDark: '#156060',
  tealLight: '#EEF8F8', green: '#1A9E73', red: '#DC4444',
  text: '#0D1F1F', textMid: '#4A7070', textLight: '#8BBCBC',
  border: '#C8E4E4', mono: '"JetBrains Mono", monospace',
  ui: 'system-ui, -apple-system, sans-serif',
};

type Msg = { role: 'user' | 'assistant'; content: string };
type CatRecord = {
  id: string; nome: string; codice_articolo?: string;
  um?: string; valore_unitario?: number; cat?: string;
  fornitore?: string; materiale?: string; superficie?: string;
  note?: string; campi_applicazione?: string[];
  tipo_record?: string;
};

// Suggerimenti rapidi per l'utente
const SUGGERIMENTI = [
  'Che vite uso per fissare un infisso PVC su mattone?',
  'Nastro per sigillatura serramento GEV-EMICODE?',
  'DPI obbligatori per lavori in quota tetto?',
  'Schiuma antifuoco per passante impianti?',
  'Prodotti basse emissioni per ambienti sani?',
  'Fissaggio strutturale bulloni HV M16?',
];

async function caricaCatalogo(): Promise<CatRecord[]> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/catalogo_galassia?select=*&order=cat.asc,nome.asc&limit=500`, {
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
    });
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}

function buildSystemPrompt(catalogo: CatRecord[]): string {
  // Raggruppa per categoria per rendere il contesto leggibile
  const bycat: Record<string, CatRecord[]> = {};
  catalogo.forEach(c => {
    const cat = c.cat || 'altro';
    if (!bycat[cat]) bycat[cat] = [];
    bycat[cat].push(c);
  });

  const sezioni = Object.entries(bycat).map(([cat, items]) => {
    const lista = items.map(i => {
      const parts = [`- ${i.nome}`];
      if (i.codice_articolo && i.codice_articolo !== 'N/D') parts.push(`(cod: ${i.codice_articolo})`);
      if (i.um) parts.push(`| ${i.um}`);
      if (i.valore_unitario) parts.push(`| €${i.valore_unitario}`);
      if (i.materiale) parts.push(`| mat: ${i.materiale}`);
      if (i.superficie) parts.push(`| sup: ${i.superficie}`);
      if (i.note) parts.push(`| ${i.note}`);
      if (i.campi_applicazione?.length) parts.push(`| uso: ${i.campi_applicazione.join(', ')}`);
      return parts.join(' ');
    }).join('\n');
    return `### ${cat.toUpperCase()} (${items.length} prodotti)\n${lista}`;
  }).join('\n\n');

  return `Sei GALASSIA AI, l'assistente tecnico integrato in MASTRO MONTAGGI.
Sei specializzato nel settore serramenti, infissi, montaggio e cantiere.
Hai accesso al catalogo prodotti Würth e altri fornitori caricato nel database.

CATALOGO PRODOTTI DISPONIBILE (${catalogo.length} articoli):
${sezioni}

REGOLE DI RISPOSTA:
- Rispondi in italiano, tono professionale ma diretto
- Per domande su prodotti: suggerisci articolo specifico con codice se disponibile
- Per domande tecniche: spiega il metodo corretto con riferimento ai prodotti giusti
- Per normative: cita EN/DIN/GEV-EMICODE quando pertinente
- Se il prodotto non è nel catalogo: dillo chiaramente e suggerisci la categoria
- Risposte brevi e pratiche — il montatore è sul cantiere, non ha tempo
- Usa liste quando ci sono più opzioni
- MAI inventare codici articolo non presenti nel catalogo`;
}

async function callGalassiaAI(messages: Msg[], catalogo: CatRecord[]): Promise<string> {
  const systemPrompt = buildSystemPrompt(catalogo);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await r.json();
    return data.content?.[0]?.text || 'Errore nella risposta AI.';
  } catch (e) {
    return 'Errore di connessione con GALASSIA AI.';
  }
}

export default function GalassiaAI() {
  const [catalogo, setCatalogo] = React.useState<CatRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [catStats, setCatStats] = React.useState<Record<string,number>>({});
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    caricaCatalogo().then(cat => {
      setCatalogo(cat);
      // Calcola statistiche per categoria
      const stats: Record<string,number> = {};
      cat.forEach(c => { stats[c.cat||'altro'] = (stats[c.cat||'altro']||0)+1; });
      setCatStats(stats);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, thinking]);

  const send = async (testo?: string) => {
    const q = testo || input.trim();
    if (!q || thinking) return;
    setInput('');
    const nuovi: Msg[] = [...msgs, { role: 'user', content: q }];
    setMsgs(nuovi);
    setThinking(true);
    const risposta = await callGalassiaAI(nuovi, catalogo);
    setMsgs(p => [...p, { role: 'assistant', content: risposta }]);
    setThinking(false);
  };

  const C: React.CSSProperties = {
    background: 'linear-gradient(145deg,#fff,#f4fcfc)',
    borderRadius: 14, border: `1.5px solid ${DS.border}`,
    boxShadow: '0 2px 8px rgba(40,160,160,.08)', padding: 14,
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${DS.border}`, borderTopColor: DS.teal, animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: DS.textMid }}>Carico catalogo Galassia...</div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* HEADER CON STATS */}
      <div style={{ padding: '10px 16px', background: DS.topbar, borderBottom: `1px solid rgba(40,160,160,0.2)`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {/* Logo galassia SVG */}
          <svg width="20" height="20" viewBox="0 0 200 200" fill="none">
            <rect x="95" y="15" width="10" height="10" rx="2" fill="#2FA7A2"/>
            <rect x="130" y="25" width="10" height="10" rx="2" fill="#7ED957"/>
            <rect x="165" y="95" width="10" height="10" rx="2" fill="#7ED957"/>
            <rect x="95" y="175" width="10" height="10" rx="2" fill="#2FA7A2"/>
            <rect x="25" y="95" width="10" height="10" rx="2" fill="#F59E0B"/>
            <g transform="rotate(8 100 100)">
              <rect x="55" y="55" width="90" height="90" rx="22" fill="#2FA7A2"/>
              <path d="M70 70 L130 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
              <path d="M130 70 L70 130" stroke="#F2F1EC" strokeWidth="18" strokeLinecap="round"/>
            </g>
          </svg>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: DS.ui }}>GALASSIA AI</span>
          <span style={{ background: 'rgba(40,160,160,0.2)', color: DS.teal, borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
            {catalogo.length} prodotti
          </span>
        </div>
        {/* Pillole categorie */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(catStats).slice(0, 5).map(([cat, n]) => (
            <span key={cat} style={{ background: 'rgba(255,255,255,0.08)', color: DS.textLight, borderRadius: 20, padding: '2px 7px', fontSize: 9, fontWeight: 600 }}>
              {cat} ({n})
            </span>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* BENVENUTO se no messaggi */}
        {msgs.length === 0 && (
          <>
            <div style={{ ...C, borderColor: DS.teal }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: DS.text, marginBottom: 6 }}>
                Ciao! Sono GALASSIA AI.
              </div>
              <div style={{ fontSize: 13, color: DS.textMid, lineHeight: 1.5 }}>
                Conosco <strong style={{ color: DS.teal }}>{catalogo.length} prodotti</strong> nel catalogo — viti, nastri, sigillanti, schiume, DPI, bulloneria e altro.
                Chiedimi il prodotto giusto per ogni lavoro.
              </div>
            </div>
            <div style={{ fontSize: 11, color: DS.textLight, fontWeight: 600, marginBottom: 4 }}>DOMANDE RAPIDE</div>
            {SUGGERIMENTI.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ background: '#fff', border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: DS.text, fontFamily: DS.ui, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.teal} strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {s}
              </button>
            ))}
          </>
        )}

        {/* MESSAGGI */}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 200 200" fill="none">
                  <g transform="rotate(8 100 100)">
                    <rect x="55" y="55" width="90" height="90" rx="22" fill="#fff"/>
                    <path d="M70 70 L130 130" stroke="#28A0A0" strokeWidth="18" strokeLinecap="round"/>
                    <path d="M130 70 L70 130" stroke="#28A0A0" strokeWidth="18" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              background: m.role === 'user' ? DS.teal : '#fff',
              borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              padding: '10px 14px',
              border: m.role === 'user' ? 'none' : `1.5px solid ${DS.border}`,
              boxShadow: m.role === 'assistant' ? '0 2px 8px rgba(40,160,160,.06)' : 'none',
            }}>
              {m.role === 'user'
                ? <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.5 }}>{m.content}</div>
                : <MarkdownMsg text={m.content} />
              }
            </div>
          </div>
        ))}

        {/* THINKING */}
        {thinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: DS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 200 200" fill="none"><g transform="rotate(8 100 100)"><rect x="55" y="55" width="90" height="90" rx="22" fill="#fff"/><path d="M70 70 L130 130" stroke="#28A0A0" strokeWidth="18" strokeLinecap="round"/><path d="M130 70 L70 130" stroke="#28A0A0" strokeWidth="18" strokeLinecap="round"/></g></svg>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', border: `1.5px solid ${DS.border}`, display: 'flex', gap: 4 }}>
              {[0,1,2].map(j=>(
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: DS.teal, animation: `pulse 1.2s ease-in-out ${j*0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: 12, borderTop: `1px solid ${DS.border}`, background: '#fff', flexShrink: 0, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Chiedi un prodotto o consiglio tecnico..."
          disabled={thinking}
          style={{ flex: 1, padding: '11px 14px', border: `1.5px solid ${DS.border}`, borderRadius: 10, fontSize: 14, fontFamily: DS.ui, outline: 'none', background: thinking ? DS.tealLight : '#fff' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || thinking}
          style={{ background: input.trim() && !thinking ? DS.teal : DS.tealLight, color: input.trim() && !thinking ? '#fff' : DS.textLight, border: 'none', borderRadius: 10, padding: '11px 16px', cursor: input.trim() && !thinking ? 'pointer' : 'default', boxShadow: input.trim() && !thinking ? `0 4px 0 0 ${DS.tealDark}` : 'none', transition: 'all 80ms', fontFamily: DS.ui, fontWeight: 700, fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
        {msgs.length > 0 && (
          <button onClick={() => setMsgs([])} style={{ background: DS.tealLight, color: DS.textMid, border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: '11px 12px', cursor: 'pointer', fontFamily: DS.ui, fontSize: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.71"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Renderer markdown minimale per la risposta AI
function MarkdownMsg({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: 14, color: '#0D1F1F', lineHeight: 1.6, fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <div key={i} style={{ fontWeight: 800, fontSize: 13, color: '#28A0A0', marginTop: 10, marginBottom: 4 }}>{line.slice(4)}</div>;
        if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 800, fontSize: 14, color: '#0D1F1F', marginTop: 10, marginBottom: 4 }}>{line.slice(3)}</div>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
            <span style={{ color: '#28A0A0', fontWeight: 700, flexShrink: 0 }}>•</span>
            <span>{formatInline(line.slice(2))}</span>
          </div>
        );
        if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 700, marginBottom: 2 }}>{line.slice(2, -2)}</div>;
        if (line === '') return <div key={i} style={{ height: 6 }}/>;
        return <div key={i} style={{ marginBottom: 2 }}>{formatInline(line)}</div>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Bold **...**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: '#0D1F1F' }}>{p.slice(2, -2)}</strong>
      : p
  );
}
